import type { CollectionConfig } from 'payload'

export const ProjectScopes: CollectionConfig = {
  slug: 'project-scopes',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sort_order', 'updatedAt'],
  },
  defaultSort: 'sort_order',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: '担当範囲名',
    },
    {
      name: 'sort_order',
      type: 'number',
      label: '並び順',
      admin: { description: '数値が小さいほど前に表示されます' },
    },
  ],
}
