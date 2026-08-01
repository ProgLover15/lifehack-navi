---
userApproved: true
purpose: 知らなかったハックに出会える発見体験を主役にし、AI相談は補助として段階的に開くUXに再設計する
---

# TASK — Phase 0 最小公開

## やりたいこと

既存原型をそのまま活かし、課金検証に必要な最小機能だけ足す。

## できあがりのイメージ

- 本番（またはローカル）でAI相談が動く
- Freeは月3回、4回目でPro案内
- Stripe Payment Link + パスコードでPro解除
- 法務ページ3種がフッターから見える

## 制約・前提

- Clerk / Supabase / Webhook は Phase 1 までやらない
- GEMINI_API_KEY はサーバー側のみ

## 絶対に起きてはいけないこと

- APIが無制限でGemini原価が爆発する
- 法律・金融を専門家レベルで断定する表示

## 受け入れ条件

- [x] `npm test` 通過
- [x] Free 4回目で402 + Pro案内
- [x] 有効パスコードで無制限化
- [x] 法務3ページ表示
- [x] `npm run dev` で画面操作確認

## 触るファイル

- `server.ts`, `package.json`, `.env.example`
- `src/App.tsx`, `src/components/Navbar.tsx`, `src/components/HeroAIConsult.tsx`, `src/components/MoodConcierge.tsx`, `src/components/LifehackModal.tsx`
- 新規: `src/lib/usage.ts`, `src/components/ProModal.tsx`, `src/components/LegalPage.tsx`, `tests/api.test.ts`

---

# TASK — Phase 0.5 発見ファーストUX

## やりたいこと

トップの主役をAI相談から「知らなかったハックとの出会い」に入れ替え、初見はシンプルな発見フローだけに絞る。

## できあがりのイメージ

- 開くと「今日の一押し」1枚＋テーマ5つ＋発見カード列
- AI入力欄はファーストビューにない（下部シートで開く）
- カード・詳細はベネフィット先出し、手順がすぐ読める
- 検索・9カテゴリは「もっと探す」内

## 絶対に起きてはいけないこと

- 初見でAIヒーロー・2タップ相談・料金帯が並んで迷わせる
- API無制限化や課金ロジックの破壊

## 受け入れ条件

- [x] 初見でAI入力欄がファーストビューにない
- [x] 今日の一押しタップで詳細モーダルが開く（Phase 0.6で固定一押しを廃止し、困りごと入口→詳細へ置換）
- [x] テーマ5つのみ表示、検索は「もっと探す」内（Phase 0.6の困りごと入口5つとして確認）
- [x] 下部シートからAI相談・無料3回制限が動く
- [x] `npm test` 全通過
- [x] ブラウザで発見フロー（一押し→手順→保存）を確認（Phase 0.6の入口→詳細→保存で確認）

## 触るファイル

- `src/App.tsx`, `src/components/Navbar.tsx`, `src/components/CategoryFilter.tsx`
- `src/components/LifehackCard.tsx`, `src/components/LifehackModal.tsx`
- 新規: `src/components/DiscoveryHero.tsx`, `src/components/ThemeChips.tsx`, `src/components/AIConsultSheet.tsx`

---

# TASK — Phase 0.6 関連度優先発見UX

## やりたいこと

固定の「今日の一押し1枚」をやめ、困りごと入口から関連カード束（3〜6件）へ最短で入れるトップに変える。

## できあがりのイメージ

- 困りごと入口5つ（ラクしたい / お金 / 制度 / 仕事 / 親・将来）
- 入口選択で関連カード束のみ表示（全件グリッドは初回非表示）
- `別の切り口を見る` / `もっと探す` で軌道修正
- AI相談は最下部の補助のまま

## 受け入れ条件

- [x] 初回表示で「今日の一押し1枚勝負」になっていない
- [x] 困りごと入口が5個見える
- [x] 入口選択で関連カード束3〜6件が出る
- [x] `別の切り口` / `もっと探す` へすぐ行ける
- [x] `npm test` 全通過
- [x] ブラウザで「入口選択 → 関連束 → 詳細 → 保存」を確認

## 触るファイル

- `src/App.tsx`, `src/types.ts`
- `src/data/intents.ts`, `src/lib/intentClusters.ts`
- `src/components/DiscoveryHero.tsx`, `src/components/IntentChips.tsx`
- `tests/intentClusters.test.ts`

---

# TASK — Phase 0.7 売れるか机上調査

## やりたいこと

公開・集客なしで、現行プロダクトが売れる構造かを競合・代替・課金ファネルの3軸で机上評価し、Go/No-Goを文書化する。

## できあがりのイメージ

- `DISCOVERY.md` に Phase 0.7 節（競合表・スコアカード・判定・1変数提案）
- Pro AI と発見課金のどちらが先に現実的かが読める
- 次の実地検証の条件が明文化されている

## 制約・前提

- コード変更・公開・Stripe本番・有料原稿はしない（verify-before-sell）
- 推定と事実を分離して書く

## 絶対に起きてはいけないこと

- 「売れる」と断定して実装や販売CTAに進む
- 複数変数を同時に変える提案を「次の一手」にする

## 受け入れ条件

- [x] 競合・代替 10件以上の比較表がある
- [x] A（Pro AI）vs B（発見課金）のスコアカードがある
- [x] Go/条件付きGo/No-Go 判定が1行で明示されている
- [x] 公開前の「1変数だけ」提案がある
- [x] `DISCOVERY.md` Phase 0.7 に清書済み

## 触るファイル

- `DISCOVERY.md`
- `TASK.md`（本セクション追記のみ）

---

# TASK — Phase 0.8 Pro訴求変更（自分用シミュレーション）

## やりたいこと

Proの訴求を「AI相談」から「お金・制度を自分の状況で聞く」に寄せ、Phase 0.7 机上調査の推奨1変数を反映する。価格・機能・APIは変えない。

## できあがりのイメージ

- ProModal・下部シート・記事追質問・フッター・Navbar・402文言が統一された訴求
- 「記事は無料、自分の状況での相談は月3回まで（Proで無制限）」が読める

## 制約・前提

- ¥680/月は変更しない
- ロジック・クォータ・Stripe連携は触らない（文言のみ）

## 絶対に起きてはいけないこと

- 価格変更や機能追加を同時に行う（2変数化）
- 法律・金融の断定表現を強める

## 受け入れ条件

- [x] ProModalが「自分の状況・お金・制度」訴求になっている
- [x] AIConsultSheet・LifehackModalのラベルが揃っている
- [x] フッター・Navbar・402エラー文言が更新されている
- [x] `npm test` 全通過
- [x] ブラウザでProModal・下部シートの表示を確認

## 触るファイル

- `src/components/ProModal.tsx`, `AIConsultSheet.tsx`, `LifehackModal.tsx`
- `src/App.tsx`, `src/components/Navbar.tsx`
- `server.ts`, `src/lib/usage.ts`
- `BRIEF.md`, `TASK.md`

---

# TASK — Phase 0.9 Render公開 + H1検証

## やりたいこと

Render に本番デプロイし、サーバーログ計測付きで28日間の初売上検証（Pro 1件）を開始できる状態にする。

## できあがりのイメージ

- 本番ビルドが動く（静的配信バグ修正済み）
- `/api/event` で Render Logs に計測イベントが出る
- README に Stripe/Render のコピペ手順がある

## 制約・前提

- Webhook・DB・外部アナリティクスは入れない
- 価格・訴求は Phase 0.8 のまま（1変数のみ既反映）

## 絶対に起きてはいけないこと

- デプロイと同時に価格変更・機能追加（2変数化）
- 本番パス修正なしで Render に出す

## 受け入れ条件

- [x] 本番 `distPath` 修正済み
- [x] `POST /api/event` + 5イベント配線
- [x] `render.yaml` + README 手順
- [x] `npm test` 全通過
- [x] `npm run build` + production start で `/health` OK
- [x] 本番起動・ブラウザで発見フロー・ProModal・計測APIを確認
- [x] GitHub push 可能な状態（render.yaml 単体リポジトリ対応）
- [ ] Render デプロイ + Stripe 本番リンク（アカウント操作）

## 触るファイル

- `server.ts`, `src/lib/analytics.ts`, `src/App.tsx`, `ProModal.tsx`, `AIConsultSheet.tsx`
- `render.yaml`, `README.md`, `DISCOVERY.md`, `tests/api.test.ts`
