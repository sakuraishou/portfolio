import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title', // 管理画面でタイトルを表示
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: '実績名',
    },
    {
      name: 'mainImage',
      type: 'upload', // 種類を upload にします
      relationTo: 'media', // さっき作った media コレクションから選ぶように指定
      required: false,
      label: 'メイン画像',
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
  ],
}
