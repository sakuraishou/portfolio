import type { CollectionConfig } from 'payload'

export const SkillCategories: CollectionConfig = {
  slug: 'skill-categories',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'カテゴリー名',
    },
    {
      name: 'sort_order',
      type: 'number',
      label: '並び順',
      admin: { description: '数値が小さいほど前に表示されます' },
    },
  ],
}
