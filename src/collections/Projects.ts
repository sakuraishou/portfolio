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
