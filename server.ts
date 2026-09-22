import 'dotenv/config';
import * as Sentry from '@sentry/node';
import express from 'express';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import {
  checkConsultQuota,
  getClientIp,
  getProCodes,
  isValidProToken,
  recordConsult,
} from './server/quota.js';

export const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MAX_SITUATION_LENGTH = 2000;
const MAX_QUESTION_LENGTH = 1000;
const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.05,
    sendDefaultPii: false,
  });
}

function captureException(error: unknown): void {
  if (SENTRY_DSN) {
    Sentry.captureException(error);
  }
}

app.set('trust proxy', 1);
app.use(express.json({ limit: '32kb' }));

app.use(
  '/api',
  rateLimit({
    windowMs: 60_000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'リクエストが多すぎます。しばらく待ってから再度お試しください。' },
  })
);

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `
あなたは日本最大級のライフハック総合プラットフォーム「ライフハックナビ」の専属AIコンシェルジュです。
ユーザーからの日常の悩み、ビジネス、PC操作、料理、掃除、お金・資産管理、相続・法律、補助金・公的制度などの相談に対し、
「明日からすぐ使える実践的で具体的なライフハック」を提案してください。

回答のルール：
1. 日本の文化、法制度、市販品（100円ショップのダイソー・セリア、コンビニ、無印良品など）、日本のビジネス習慣に即した現実的な内容にすること。
2. 抽象的な精神論ではなく、「具体的なアクションステップ（手順）」を示すこと。
3. リスクや注意点（法律や補助金の期限、規約違反にならないか等）があれば簡潔に添えること。
4. トーンは親しみやすく、かつ信頼感のあるスマートなアドバイザー口調で。

出力は必ず以下のJSONフォーマットで返してください：
{
  "title": "ライフハックの魅力的なキャッチコピータイトル（30文字以内）",
  "category": "PC・IT | 料理・家事 | 掃除・洗濯 | 会社・仕事 | 学校・勉強 | お金・節約 | 相続・法律 | 補助金・制度 | 緊急・その他 のいずれか",
  "timeRequired": "約〇〇分 / 即効",
  "difficulty": "カンタン | 普通 | 本格的",
  "summary": "解決策の概要（2〜3文）",
  "steps": [
    "ステップ1の手順説明",
    "ステップ2の手順説明",
    "ステップ3の手順説明"
  ],
  "itemsNeeded": ["必要な道具やアイテム（例：クリアファイル、ダイソーの重曹など）"],
  "caution": "知っておくべき落とし穴や注意点（特になければ「特になし」）",
  "proTip": "さらに効果を倍増させる裏ワザ・豆知識"
}
`;

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'lifehack-navi' });
});

const ALLOWED_ANALYTICS_EVENTS = new Set([
  'pro_modal_open',
  'consult_start',
  'quota_exceeded',
  'bookmark_add',
  'intent_switch',
]);

function sanitizeEventMeta(meta: unknown): Record<string, string | number | boolean> {
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) {
    return {};
  }
  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(meta as Record<string, unknown>)) {
    if (Object.keys(safe).length >= 5) break;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      safe[key] = value;
    }
  }
  return safe;
}

app.post('/api/event', (req, res) => {
  const event = typeof req.body?.event === 'string' ? req.body.event : '';
  if (!ALLOWED_ANALYTICS_EVENTS.has(event)) {
    return res.status(400).json({ error: '無効なイベント名です。' });
  }
  const payload = {
    type: 'analytics',
    event,
    meta: sanitizeEventMeta(req.body?.meta),
    ts: new Date().toISOString(),
  };
  console.log(JSON.stringify(payload));
  return res.json({ ok: true });
});

app.post('/api/verify-pro', (req, res) => {
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  if (!code) {
    return res.status(400).json({ error: 'パスコードを入力してください。', valid: false });
  }
  if (!isValidProToken(code)) {
    return res.status(401).json({ error: 'パスコードが無効です。', valid: false });
  }
  return res.json({ valid: true, token: code });
});

app.post('/api/consult', async (req, res) => {
  try {
    const situation = typeof req.body?.situation === 'string' ? req.body.situation.trim() : '';
    const category = typeof req.body?.category === 'string' ? req.body.category : '';
    const proToken = typeof req.headers['x-pro-token'] === 'string' ? req.headers['x-pro-token'] : undefined;
    const ip = getClientIp(req);

    if (!situation) {
      return res.status(400).json({ error: '状況や悩みを入力してください。' });
    }
    if (situation.length > MAX_SITUATION_LENGTH) {
      return res.status(400).json({ error: `相談内容は${MAX_SITUATION_LENGTH}文字以内にしてください。` });
    }

    const quota = checkConsultQuota(ip, proToken);
    if (!quota.allowed) {
      return res.status(402).json({
        error: '今月の無料「自分用」枠（3回）を使い切りました。Proでお金・制度をあなたの状況で無制限に聞けます。',
        code: 'QUOTA_EXCEEDED',
      });
    }

    const ai = getAIClient();
    const prompt = `以下のユーザーの状況・悩みに対して、日本の現代の実情に合った最高のライフハックを1つ提案してください。\n\n【相談内容/シチュエーション】\n${situation}\n${category && category !== 'すべて' ? `【希望カテゴリー】 ${category}` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('AIから回答を得られませんでした。');
    }

    const parsed = JSON.parse(responseText) as Record<string, unknown>;
    if (!isValidProToken(proToken)) {
      recordConsult(ip);
    }

    res.json(parsed);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'AIコンシェルジュの通信中にエラーが発生しました。';
    console.error('AI Consult Error:', error);
    captureException(error);
    res.status(500).json({ error: message });
  }
});

app.post('/api/followup', async (req, res) => {
  try {
    const hackTitle = typeof req.body?.hackTitle === 'string' ? req.body.hackTitle : '';
    const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
    const previousContext = typeof req.body?.previousContext === 'string' ? req.body.previousContext : '';
    const proToken = typeof req.headers['x-pro-token'] === 'string' ? req.headers['x-pro-token'] : undefined;

    if (!question) {
      return res.status(400).json({ error: '質問内容を入力してください。' });
    }
    if (question.length > MAX_QUESTION_LENGTH) {
      return res.status(400).json({ error: `質問は${MAX_QUESTION_LENGTH}文字以内にしてください。` });
    }
    if (!isValidProToken(proToken)) {
      return res.status(402).json({
        error: '自分の状況での追加確認はProプラン限定です。',
        code: 'PRO_REQUIRED',
      });
    }

    const ai = getAIClient();
    const prompt = `あなたはライフハック「${hackTitle}」の専門解説者です。
背景情報：${previousContext || ''}

ユーザーから以下の追加質問がありました。簡潔でわかりやすく、すぐ実践できるアドバイスを日本語で回答してください。
質問：${question}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    res.json({ answer: response.text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '追加質問の処理に失敗しました。';
    console.error('Followup Error:', error);
    captureException(error);
    res.status(500).json({ error: message });
  }
});

async function startServer(): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (getProCodes().length === 0) {
    console.warn('[lifehack-navi] PRO_CODES is not set. Pro unlock will not work until configured.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lifehack Navi server running on port ${PORT}`);
  });
}

const isTestEnv = process.env.VITEST === 'true' || process.env.NODE_ENV === 'test';
if (!isTestEnv) {
  void startServer();
}
