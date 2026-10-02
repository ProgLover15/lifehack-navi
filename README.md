# ライフハックナビ

知らなかった日本の実用ワザに出会えるWebアプリです。記事閲覧は無料です。ライフハックナビ Pro は限定ベータ中で、現在は一般向け有料販売を行っていません。

## 現在販売中のデジタル商品

アプリのPro機能とは別に、AIへ仕事を任せる前後の確認を標準化する **500円・買い切り** のテンプレートセットを販売しています。

内容:

- AI作業の準備チェックリスト
- AI出力の検収記録票
- 使い方ガイド

**購入:** https://buy.stripe.com/5kQcN55DLehn50jdRLdAk00?utm_source=github&utm_medium=organic&utm_campaign=ai_ops_checklist&utm_content=readme&client_reference_id=github_readme

決済完了後、購入時のメールアドレスへZIPを自動送付します。

無料で確認できる入口:

- [AI生成コンテンツを公開する前のチェックリスト](docs/ai-generated-content-publication-checklist.md)
- [ChatGPTの文章を公開する前のファクトチェック](docs/chatgpt-fact-check-before-publishing.md)
- [AI生成コンテンツの著作権・個人情報 公開前チェック](docs/ai-content-copyright-privacy-check.md)

## ライフハックナビ Pro

Proは現在、限定ベータ利用者向けです。一般販売・サブスクリプション課金は開始していません。ベータ利用者は案内済みのコードで利用できます。

旧「¥680/月 Pro」仮説は現在の販売オファーではありません。現行の有料オファーは上記の500円買い切りデジタル商品です。

## ローカル起動

前提: Node.js 20+

```powershell
cd ライフハックナビ
npm install
copy .env.example .env
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

## デプロイ設定

主な環境変数:

| 変数名 | 説明 |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio の API キー |
| `PRO_CODES` | 限定ベータ利用者向けコード（カンマ区切り） |
| `VITE_OPERATOR_NAME` | 特商法表示用の運営者名 |
| `VITE_OPERATOR_EMAIL` | 特商法表示用の連絡先 |
| `VITE_REFUND_POLICY` | 返金ポリシー |
| `SENTRY_DSN` | 任意 |
| `PORT` | 任意 |

Renderを使う場合は [render.yaml](render.yaml) を参照してください。Proの一般販売開始を前提にした旧Stripeサブスクリプション設定は使用しません。

## 計測方針

内部イベントは必要に応じて以下を確認できます。

- `pro_modal_open`
- `consult_start`
- `quota_exceeded`
- `bookmark_add`
- `intent_switch`

販売判断はイベント数だけでなく、500円商品の実Checkout・流入元・外部需要を優先します。新しいコンテンツや有料広告は、実需要またはconversion signalが確認された場合にだけ増やします。
