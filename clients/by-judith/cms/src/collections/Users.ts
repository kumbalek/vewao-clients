import type { CollectionConfig } from 'payload'

import { hasRole, isAdmin } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Uživatel', plural: 'Uživatelé' },
  admin: { useAsTitle: 'email', group: 'Nastavení' },
  // API keys: Medusa's product sync and the storefront's draft reader.
  auth: { useAPIKey: true },
  access: {
    read: ({ req }) => (hasRole(req.user, 'admin') ? true : { id: { equals: req.user?.id } }),
    create: isAdmin,
    update: ({ req }) => (hasRole(req.user, 'admin') ? true : { id: { equals: req.user?.id } }),
    delete: isAdmin,
    // Integration users get no admin panel.
    admin: ({ req }) => hasRole(req.user, 'admin', 'editor'),
  },
  fields: [
    {
      name: 'roles',
      label: 'Role',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      saveToJWT: true,
      access: { update: ({ req }) => hasRole(req.user, 'admin') },
      options: [
        { label: 'Správce', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Medusa (integrace)', value: 'medusa' },
        { label: 'Storefront – náhledy (integrace)', value: 'storefront' },
      ],
    },
  ],
}
