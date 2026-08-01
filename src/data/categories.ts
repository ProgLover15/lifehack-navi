import { Category, QuickSituationPrompt } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'all',
    name: 'すべてのライフハック',
    shortName: 'すべて',
    icon: 'Sparkles',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100',
    borderColor: 'border-indigo-200',
    description: '日常の些細なイライラから人生の大きな手続きまで総合検索',
    popularTags: ['時短', '100均', '節約', '裏ワザ', 'スマホ', '新NISA']
  },
  {
    id: 'pc',
    name: 'PC・IT・スマホ効率化',
    shortName: 'PC・IT',
    icon: 'Laptop',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    borderColor: 'border-blue-200',
    description: 'ショートカット術、Excel・Word爆速化、AI活用、ブラウザ最適化',
    popularTags: ['Win+V', 'ChatGPT術', 'スクショ時短', 'パスワード管理', 'デュアルモニタ']
  },
  {
    id: 'cooking',
    name: '料理・レシピ・食材保存',
    shortName: '料理・家事',
    icon: 'UtensilsCrossed',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    borderColor: 'border-orange-200',
    description: '包丁いらず10分飯、冷凍保存ハック、洗い物激減テク、調味料代用',
    popularTags: ['アイラップ活用', 'レンジ10分', '肉の解凍', 'キャベツ長持ち', 'ワンパスタ']
  },
  {
    id: 'cleaning',
    name: '掃除・洗濯・整理収納',
    shortName: '掃除・収納',
    icon: 'Sparkle',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 hover:bg-teal-100',
    borderColor: 'border-teal-200',
    description: '100均グッズ超活用、お風呂の水垢・カビ撃退、部屋干し臭ゼロ術',
    popularTags: ['オキシ漬け', 'クエン酸水', 'ウロコ取り', 'セリア収納', 'コード配線']
  },
  {
    id: 'work',
    name: '会社・仕事・メール調整',
    shortName: '会社・仕事',
    icon: 'Briefcase',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100 hover:bg-slate-200',
    borderColor: 'border-slate-300',
    description: '角が立たないメール定型文、無駄な会議スルー術、社内政治ハック',
    popularTags: ['お断りメール', '定時退社術', '1on1対策', 'プレゼン3分枠', '議事録AI']
  },
  {
    id: 'school',
    name: '学校・勉強・受験資格',
    shortName: '学校・勉強',
    icon: 'GraduationCap',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100',
    borderColor: 'border-emerald-200',
    description: '暗記ハック、集中力25分サイクル、レポート効率化、通学通勤対策',
    popularTags: ['ポモドーロ', '青ペン暗記', '要約ハック', '眠気撃退', '暗記シート']
  },
  {
    id: 'money',
    name: 'お金・資産管理・節約',
    shortName: 'お金・資産',
    icon: 'Wallet',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
    borderColor: 'border-amber-200',
    description: '新NISA設定ハック、ふるさと納税の極意、固定費・サブスク見直し',
    popularTags: ['新NISAオルカン', 'ふるさと納税', '格安SIM', 'ポイ活3重取り', '医療費控除']
  },
  {
    id: 'law',
    name: '相続・法律・契約知識',
    shortName: '相続・法律',
    icon: 'Scale',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    borderColor: 'border-purple-200',
    description: '親の介護・相続手続きの基本、フリーランス契約防衛、敷金返還知識',
    popularTags: ['エンディングノート', '遺言書書式', '敷金トラブル', '退職代行知識', 'クーリングオフ']
  },
  {
    id: 'subsidy',
    name: '補助金・助成金・公的制度',
    shortName: '補助金・制度',
    icon: 'Landmark',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 hover:bg-rose-100',
    borderColor: 'border-rose-200',
    description: '知らないと大損する自治体補助金、教育訓練給付金、高額療養費制度',
    popularTags: ['高額療養費', '住まい給付金', 'リスキリング補助', '出産育児一時金', 'こどもエコすまい']
  },
  {
    id: 'emergency',
    name: '緊急・防犯・生活トラブル',
    shortName: '緊急・防犯',
    icon: 'ShieldAlert',
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100',
    borderColor: 'border-red-200',
    description: 'スマホ水没・紛失時の対処、地震停電時の備え、不審者・害虫即席対策',
    popularTags: ['スマホ紛失検索', '停電時ライト', 'G撃退スプレー代用', '鍵閉じ込め']
  }
];

export const QUICK_PROMPTS: QuickSituationPrompt[] = [
  {
    id: 'q1',
    label: 'PC作業を今すぐ3倍速にしたい',
    prompt: 'Windows/Macの普段の事務作業や文章入力が格段に速くなる、あまり知られていない神キーボードショートカットや設定を教えて',
    category: 'pc',
    icon: 'Zap'
  },
  {
    id: 'q2',
    label: 'やる気0%…洗い物を出さずに夜食',
    prompt: '残業疲れでクタクタ。包丁もまな板もフライパンも使わずに、マグカップやアイラップだけで作れる美味しくてお腹にたまる夜食レシピハックを教えて',
    category: 'cooking',
    icon: 'Soup'
  },
  {
    id: 'q3',
    label: 'お風呂の鏡のウロコ・水垢を即撃退',
    prompt: 'お風呂場の鏡についた白くて頑固なウロコ汚れ。100均にあるもので今日すぐピカピカにする一番ラクな裏ワザを教えて',
    category: 'cleaning',
    icon: 'Sparkles'
  },
  {
    id: 'q4',
    label: '上司への「お断りメール」角を立てない文面',
    prompt: '急な残業や気の進まない飲み会の誘いを、相手に嫌な気持ちにさせずスマートに断るビジネスメールの鉄板フレーズ・言い換えハックを教えて',
    category: 'work',
    icon: 'Mail'
  },
  {
    id: 'q5',
    label: '親が元気なうちにやるべき相続準備',
    prompt: '実家の親が70代になりました。将来の相続トラブルや口座凍結を防ぐために、今から親子で無理なく確認しておくべき3つのステップを教えて',
    category: 'law',
    icon: 'FileText'
  },
  {
    id: 'q6',
    label: 'もらい損ねてない？サラリーマンの給付金',
    prompt: '普通に会社員として働いていても確定申告や申請をするだけでお金が戻ってくる（医療費控除や特定支出、自治体の補助金など）代表的な制度ハックをまとめて',
    category: 'subsidy',
    icon: 'Coins'
  },
  {
    id: 'q7',
    label: '勉強・仕事の睡魔を2分で消し去る術',
    prompt: '午後の会議中や勉強中に襲ってくる強烈な眠気。カフェイン以外で、その場で誰にもバレずに脳をシャキッと覚醒させる身体ハックを教えて',
    category: 'school',
    icon: 'Coffee'
  },
  {
    id: 'q8',
    label: '毎月のサブスク・固定費を月1万円削るハック',
    prompt: '我慢する節約は嫌です。スマホ代、ネット代、サブスク、電気代などの「契約を見直すだけで自動的に毎月浮くお金ハック」の優先順位を教えて',
    category: 'money',
    icon: 'PiggyBank'
  }
];
