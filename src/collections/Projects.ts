import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title', // 管理画面でタイトルを表示
    defaultColumns: ['title', 'sort_order', 'updatedAt'],
  },
  defaultSort: 'sort_order',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: '実績名',
    },
    {
      name: 'sort_order',
      type: 'number',
      label: '並び順',
      admin: { description: '数値が小さいほど前に表示されます' },
    },
    {
      name: 'summary',
      type: 'textarea',
      label: '一言説明（一覧カード用）',
      admin: {
        description:
          '20〜45文字程度。案件の課題や価値が1行で伝わる説明。例: 複数サイトの掲載情報を一画面で横断管理',
      },
    },
    {
      name: 'workType',
      type: 'select',
      label: '案件種別',
      defaultValue: 'case-study',
      options: [
        { label: 'ケーススタディ（課題・技術選定・工夫・結果がある案件）', value: 'case-study' },
        { label: 'サイト制作・運用（Webサイトの制作・運用実績）', value: 'site-work' },
      ],
      admin: { description: '未設定の既存データはケーススタディとして表示します' },
    },
    {
      name: 'status',
      type: 'select',
      label: '状態',
      options: [
        { label: '開発中', value: 'in-development' },
        { label: '検証中', value: 'in-verification' },
        { label: '本番稼働中', value: 'in-production' },
        { label: '完了', value: 'completed' },
        { label: '社内利用', value: 'internal' },
      ],
      admin: {
        description:
          '未設定なら状態ラベルを表示しません。開発中の案件を完成品に見せないために使います',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      label: '代表案件として優先表示する',
      admin: { description: 'ONにすると、並び順より前に一覧の先頭グループへ表示します' },
    },
    {
      name: 'mainImage',
      type: 'upload', // 種類を upload にします
      relationTo: 'media', // さっき作った media コレクションから選ぶように指定
      required: false,
      label: 'メイン画像',
    },
    {
      name: 'mobileImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'SP画像',
    },
    {
      name: 'confidential',
      type: 'checkbox',
      defaultValue: false,
      label: '画像を公開しない（社外秘）',
      admin: {
        description:
          'ONにすると、画像があっても表示せず「社外秘のため画像は非公開」と表示します（NO IMAGE の代わり）。',
      },
    },
    {
      name: 'url',
      type: 'text',
      label: 'サイトURL',
    },
    {
      name: 'description',
      type: 'textarea',
      label: '説明文',
    },
    {
      name: 'challenge',
      type: 'textarea',
      label: '課題・背景',
      admin: { description: 'なぜ作ったか／解決したかった課題（ケーススタディ用）' },
    },
    {
      name: 'approach',
      type: 'textarea',
      label: '技術選定・設計判断',
      admin: { description: 'なぜその構成にしたか。一番の見せ場（ケーススタディ用）' },
    },
    {
      name: 'highlights',
      type: 'textarea',
      label: '工夫した点・詰まった所',
      admin: { description: 'ケーススタディ用' },
    },
    {
      name: 'result',
      type: 'textarea',
      label: '結果・学び',
      admin: { description: 'ケーススタディ用' },
    },
    {
      name: 'caseSections',
      type: 'array',
      label: 'ケーススタディの章（任意順）',
      admin: {
        description:
          '1件でも登録すると、上の4項目（課題・背景／技術選定／工夫／結果）の代わりに、ここに並べた順で表示します。',
      },
      fields: [
        {
          name: 'en',
          type: 'select',
          required: true,
          label: '英字見出し',
          options: [
            { label: 'PROBLEM', value: 'PROBLEM' },
            { label: 'DECISION', value: 'DECISION' },
            { label: 'STACK', value: 'STACK' },
            { label: 'ARCHITECTURE', value: 'ARCHITECTURE' },
            { label: 'IMPLEMENTATION', value: 'IMPLEMENTATION' },
            { label: 'HIGHLIGHT', value: 'HIGHLIGHT' },
            { label: 'MIGRATION', value: 'MIGRATION' },
            { label: 'RESULT', value: 'RESULT' },
            { label: 'STATUS', value: 'STATUS' },
          ],
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          label: '日本語見出し',
          admin: { description: '例: 課題・背景 / 技術選定・設計判断 / 移行設計 / 現在の状況' },
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
          label: '本文',
        },
      ],
    },
    {
      name: 'relatedProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      label: '関連する実績',
      admin: {
        description: '「先行改善 → 残課題 → 刷新」のように、つながりのある案件を相互に指定します',
      },
    },
    {
      name: 'scope',
      type: 'relationship',
      relationTo: 'project-scopes',
      hasMany: true,
      label: '担当範囲',
      admin: {
        description: '管理画面「Project Scopes」で選択肢の数と並び順を管理できます',
      },
    },
    {
      name: 'techStack',
      type: 'array',
      label: '使用技術',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: '技術名',
        },
      ],
    },
    {
      name: 'productionDate',
      type: 'date',
      label: '制作開始月',
      admin: {
        date: {
          displayFormat: 'yyyy.MM',
        },
      },
    },
    {
      name: 'productionEndDate',
      type: 'date',
      label: '制作終了月',
      admin: {
        date: {
          displayFormat: 'yyyy.MM',
        },
      },
    },
  ],
}
