# ライフハックナビ

知らなかった日本の実用ワザに出会えるWebアプリ。記事閲覧は無料、お金・制度の自分用確認は Pro（¥680/月）。

## AIへ仕事を任せる前後のチェック

AIの出力を「それっぽいから完了」にせず、入力の正本・取得時点・権限境界・合格条件・未確認事項・停止条件まで残すための小さな運用テンプレートを扱っています。

無料で使える入口:

- [AI生成コンテンツを公開する前のチェックリスト](docs/ai-generated-content-publication-checklist.md)
- [ChatGPTの文章を公開する前のファクトチェック](docs/chatgpt-fact-check-before-publishing.md)
- [AI生成コンテンツの著作権・個人情報 公開前チェック](docs/ai-content-copyright-privacy-check.md)

有料版（500円・買い切り）は、**AI作業の準備チェックリスト / AI出力の検収記録票 / 使い方ガイド**の3ファイルです。

**購入:** https://buy.stripe.com/5kQcN55DLehn50jdRLdAk00?utm_source=github&utm_medium=organic&utm_campaign=ai_ops_checklist&utm_content=readme&client_reference_id=github_readme

決済完了後、購入時のメールアドレスへZIPを自動送付します。


## ローカル起動

前提: Node.js 20+

```powershell
cd ライフハックナビ
npm install
copy .env.example .env   # 値を設定
npm run dev
```

## テスト

```powershell
npm test
npm run lint
```

本番ビルドの確認:

```powershell
npm run build
$env:NODE_ENV='production'; npm start
# http://localhost:3000/health とトップ画面を確認
```

---

## Render デプロイ（あなたがやること：コピペ中心）

### 事前準備（ローカル `.env` からコピー可）

| 変数名 | 例 / 説明 |
|--------|-----------|
| `GEMINI_API_KEY` | Google AI Studio の API キー |
| `PRO_CODES` | 購入者に渡すパスコード（カンマ区切り）例: `pro-2026-abc,pro-2026-xyz` |
| `VITE_STRIPE_PAYMENT_LINK_URL` | Stripe 本番 Payment Link URL |
| `VITE_OPERATOR_NAME` | 特商法の運営者名 |
| `VITE_OPERATOR_EMAIL` | 特商法の連絡先メール |
| `VITE_REFUND_POLICY` | 返金ポリシー（1文で可） |

### 手順

1. **GitHub に push**（このフォルダ単体のリポジトリ、または `Projects` モノレポ）
2. [Render](https://render.com) → **New +** → **Blueprint** または **Web Service**
3. リポジトリを接続
4. **Root Directory** — 単体リポジトリなら空のまま（Blueprint なら [`render.yaml`](render.yaml) の `rootDir: .`）。モノレポなら `ライフハックナビ`
5. **Environment** に上表の変数をすべて貼る（`NODE_ENV=production` は render.yaml で設定済み）
6. **Deploy** → 完了後 `https://xxxx.onrender.com/health` が `{"ok":true}` になることを確認
7. ブラウザでトップ → 困りごと → ProModal → Stripe リンクを確認

### 計測（Render Logs）

イベントは JSON 1 行でログに出ます。Render Dashboard → サービス → **Logs** で検索:

- `"event":"pro_modal_open"`
- `"event":"consult_start"`
- `"event":"quota_exceeded"`
- `"event":"bookmark_add"`
- `"event":"intent_switch"`

28日テスト中は週1回程度、件数をメモしてください。

---

## Stripe Payment Link（10分・初回のみ）

1. [Stripe Dashboard](https://dashboard.stripe.com) → **商品** → 商品を作成（名前: ライフハックナビ Pro）
2. 価格: **¥680 / 月**（サブスクリプション）
3. **Payment Links** → リンク作成 → URL をコピー
4. Render の `VITE_STRIPE_PAYMENT_LINK_URL` に貼る → **Manual Deploy**（再ビルドが必要）

### 購入後のパスコード運用

Webhook は Phase 1 まで未実装のため、手動運用です。

1. Stripe で支払い通知メールを受け取る
2. 新しいパスコードを決める（例: `pro-2026-001`）
3. Render の `PRO_CODES` にカンマ区切りで追加 → **Save** → **Manual Deploy**
4. 購入者にパスコードをメール等で送る

---

## 28日 H1 判定

| 結果 | 条件 |
|------|------|
| 成功 | 28日以内に Pro 課金 **1件** |
| 失敗 | 課金0 → **1変数だけ** 変更して再テスト（価格 or 訴求） |

詳細: [DISCOVERY.md](DISCOVERY.md) Phase 0.9
