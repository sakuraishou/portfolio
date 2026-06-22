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
