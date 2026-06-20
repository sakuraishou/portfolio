/**
 * 「取扱説明書」ページの編集用コンテンツを集約。
 * ── 文言・数値を変えたいときは、基本このファイルだけ直せばOK ──
 * （各章コンポーネントはこのデータを読んで描画するだけ。レイアウト/アニメ/SVGの構造はコンポーネント側）
 */

/* ========================= 表紙（COVER） ========================= */
export const PRODUCT = {
  nameJa: '桜井 翔',
  nameEn: 'Sho Sakurai',
  model: 'Web Engineer / Tokyo',
  catch: 'Code With Heart.',
  lead: '桜井 翔という人間を、エンジニアらしく「取扱説明書」にまとめました。スペックも人柄も、できるだけ正直に。',
} as const

/* ===================== 01 主な機能・特長（FEATURES） ===================== */
export type Feature = {
  title: string
  body: string
}

export const FEATURES: Feature[] = [
  {
    title: '寄り添い、提案する力',
    body: '言われた通りに作るだけでなく、要望の奥にある目的まで考えて、「もっとこうしたら良くなりますよ」と一歩先の形を一緒に提案します。',
  },
  {
    title: 'AIフル活用のスピード開発',
    body: 'Cursor・Claude Code・Gemini・Codex など複数のAIを使い分けて、アイデアを最短で「動くもの」へ落とし込みます。',
  },
  {
    title: 'チームを明るく回す力',
    body: 'ピンチほど前向きに。状況を整理して、場の空気をポジティブに保つのが得意です。',
  },
  {
    title: '学び続ける吸収力',
    body: '未経験の技術でも、まず飛び込んで素早くキャッチアップ。AIを活用しながら自走し、「分からない」を楽しみながら成長し続けます。',
  },
]

export type HumanSpec = {
  label: string
  desc: string
  value: number
}

/** レーダーチャート用。0–100 の自己採点（※自社調べ） */
export const HUMAN_SPEC: HumanSpec[] = [
  { label: '寄り添う力', desc: '相手の本音を汲み取る', value: 95 },
  { label: 'コミュ力', desc: '誰とでもすぐ打ち解ける', value: 92 },
  { label: '前向きさ', desc: 'ピンチも楽しむガッツ', value: 90 },
  { label: '課題解決力', desc: 'もっと良い形を提案する', value: 91 },
  { label: '行動力', desc: 'まず作って試してみる', value: 93 },
  { label: '明るさ', desc: 'チームのムードメーカー', value: 96 },
]

/* ===================== 02 ご使用方法（USAGE） ===================== */
export type UsageStep = {
  no: string
  title: string
  body: string
}

export const USAGE_STEPS: UsageStep[] = [
  { no: '01', title: 'まず雑談から', body: '気軽に話して、やりたいことの種を一緒に見つけます。' },
  {
    no: '02',
    title: '一緒に要件を整理',
    body: 'ふわっとしたイメージや背景をすり合わせて、具体的なゴールに翻訳していきます。',
  },
  { no: '03', title: '軽く作って見せる', body: 'フットワーク軽く、早めに動くものを出します。' },
  { no: '04', title: '一緒に磨く', body: 'フィードバックを反映して、納得いくまで仕上げます。' },
]

/** 02 章の口ぐせ（複数並べる吹き出しチップ） */
export const USAGE_QUOTES = [
  'それ、めっちゃ面白いですね！',
  '楽しそう、やってみたいです！',
  'とりあえず作ってみましょう！',
  'なんとかなります！',
]

/* ===================== 03 ご使用上の注意（CAUTION） ===================== */
export const CAUTION: {
  intro: string
  notices: string[]
  photoNote: string
  photoCaption: string
} = {
  intro: '本製品（私）を末永く快適にご利用いただくため、ご使用前に必ずお読みください。',
  notices: [
    '実は掃除好き。身の回りが片付くと、頭の中まで整理されてリフレッシュできます。',
    '詰まったら、犬の散歩へ。歩くとアイデアが降りてきます。',
    '気になった技術はつい触ってしまうので、放っておくと休日が溶けます（笑）。',
  ],
  photoNote: '（犬の散歩 ＝ 最高のデバッグ環境）',
  photoCaption: '図：推奨されるリフレッシュ動作',
}

/* ===================== 04 困ったときは（FAQ） ===================== */
export const FAQ_LEAD =
  'うまく動かない時のための「故障かな？と思ったら」。各項目をタップすると、その場での僕の脳内実況ログが流れます。'

export type FaqEntry = {
  level: 'error' | 'warn'
  label: string
  lines: string[]
}

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    level: 'error',
    label: 'チーム開発でタスクがコンフリクト！',
    lines: [
      '焦っても進まない。まず深呼吸。',
      'いったん全員で、今のタスクと状況を共有する。',
      'そして「大丈夫、なんとかなります」とチームを安心させる。',
      'ピンチの時こそ明るく前向きに。実際に手を動かしながら場を回すのが僕の役割です。',
    ],
  },
  {
    level: 'warn',
    label: '触ったことのない技術が突然必要に！',
    lines: [
      '…と言いつつ、正直ここが一番テンションの上がる瞬間。',
      '新しいおもちゃが来た感覚で、まず触って楽しむ。',
      'AIと一緒に小さく試して、最短で「できた！」まで持っていく。',
      'だから僕にとっては「トラブル」じゃなく、むしろ「ごほうび」です。',
    ],
  },
  {
    level: 'warn',
    label: '仕様や要望が途中で変わった！',
    lines: [
      'ディレクター経験上、要望が変わるのは当たり前。',
      'まず変更の背景と優先度をすり合わせる。',
      '「これは活かせる」と前向きに捉えて作り直す。',
      '変化に強いのは、むしろ自分の得意分野です。',
    ],
  },
  {
    level: 'error',
    label: '締め切りが急にタイトに！',
    lines: [
      'パニックにならず、まず「やること」を全部書き出す。',
      '完璧よりも「まず動く」を優先し、削れる要素を見極める。',
      '早めに状況を共有して、期待値をすり合わせる。',
      '終わったら振り返って、次に活かすメモを残す。',
    ],
  },
]

/* ===================== 05 製品仕様（SPEC） ===================== */
export type SpecKeynote = {
  value: number
  suffix: string
  label: string
}

export const SPEC_KEYNOTES: SpecKeynote[] = [
  { value: 73, suffix: '%', label: '散歩中にアイデアが浮かぶ率' },
  { value: 98, suffix: '%', label: '1日の平均ごきげん度' },
  { value: 100, suffix: '%', label: '新しい技術へのワクワク度' },
  { value: 92, suffix: '%', label: 'ピンチを楽しめる率' },
]

export type SpecBar = {
  label: string
  value: number
}

export const SPEC_BARS: SpecBar[] = [
  { label: 'ポジティブ思考', value: 100 },
  { label: 'フィードバック歓迎', value: 96 },
  { label: '報連相のマメさ', value: 92 },
  { label: '初対面でも打ち解ける', value: 90 },
  { label: '納得いくまで作り込む', value: 94 },
  { label: 'おせっかい度', value: 86 },
]

export type SpecCharge = {
  label: string
  value: number
  color: string
}

/** 「1日の時間の使い方」ドーナツ（24h）。value の合計は 100 にする。color はパレット内の色 */
export const SPEC_CHARGE: SpecCharge[] = [
  { label: '仕事・開発', value: 35, color: '#f78c00' },
  { label: '睡眠', value: 29, color: '#5e3100' },
  { label: 'プライベート', value: 25, color: '#ffa836' },
  { label: '犬の散歩・趣味', value: 11, color: '#e4e2e1' },
]

/* ===================== 06 改訂履歴（CHANGELOG） ===================== */
export type ChangelogRelease = {
  version: string
  badge: string
  title: string
  body: string
  current?: boolean
}

export const CHANGELOG_RELEASES: ChangelogRelease[] = [
  {
    version: 'v1.0',
    badge: 'INITIAL',
    title: 'アパレル販売 ー 約10年',
    body: '接客の最前線で約10年。お客様の本音をくみ取る力と、誰とでも打ち解けるコミュニケーション力を徹底的に磨いた。',
  },
  {
    version: 'v2.0',
    badge: 'UPDATE',
    title: 'EC立ち上げ → Webディレクター',
    body: 'アパレルのEC立ち上げをきっかけにWebの世界へ。ディレクターとして制作を動かすうちに「自分の手で形にしたい」想いが強くなる。',
  },
  {
    version: 'v3.0',
    badge: 'MAJOR',
    title: 'エンジニアへ転身',
    body: '一念発起して職業訓練校で開発を学び、エンジニアの道へ。ものづくりの面白さに本格的にのめり込んでいく。',
  },
  {
    version: 'v4.0',
    badge: 'LATEST',
    title: 'モダンスタックで実プロダクト開発',
    body: 'Next.js で社内アプリを、Nuxt × Supabase のモノレポ構成で整骨院のWeb予約システム＋CRMを開発中。AI（Cursor・Claude Code 等）も使い倒し、モダンな構成を実プロダクトで形にしています。',
    current: true,
  },
]

/* ===================== 07 保証について（WARRANTY） ===================== */
export const WARRANTY: {
  ribbon: string
  title: string
  body: string[]
  details: { label: string; value: string }[]
  stampChar: string
} = {
  ribbon: 'CERTIFICATE',
  title: '保証書',
  body: [
    '本製品（桜井 翔）は、どんなピンチでも前向きに取り組み、最後まで投げ出さないことを保証します。',
    '不具合（トラブル）発生時は「なんとかします！」を合言葉に、解決まで必ず伴走します。',
  ],
  details: [
    { label: '保証期間', value: '無期限' },
    { label: '適用条件', value: '一緒に楽しむこと' },
    { label: '発行', value: 'Sho Sakurai' },
  ],
  stampChar: '翔',
}
