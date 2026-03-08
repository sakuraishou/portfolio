import type { CollectionConfig } from 'payload'

export const Skills: CollectionConfig = {
  slug: 'skills',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'スキル名',
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
