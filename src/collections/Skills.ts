import type { CollectionConfig } from 'payload'

export const Skills: CollectionConfig = {
  slug: 'skills',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'skill-categories',
      label: 'カテゴリー',
    },
    {
      name: 'sort_order',
      type: 'number',
      label: '並び順',
      admin: { description: '数値が小さいほど前に表示されます' },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'スキル名',
    },
    {
      name: 'description',
      type: 'textarea',
      label: '説明文',
    },
    {
      name: 'studying',
      type: 'checkbox',
      label: '勉強中',
      defaultValue: false,
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: '得意',
      defaultValue: false,
      admin: { description: 'チェックすると「得意」バッジを表示します' },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'アイコン画像',
    },
  ],
}
