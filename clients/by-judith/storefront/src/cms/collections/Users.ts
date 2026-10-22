import type { CollectionConfig } from 'payload'

import { hasRole, isAdmin } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Uživatel', plural: 'Uživatelé' },
  admin: { useAsTitle: 'email', group: 'Nastavení' },
  auth: {
    // API keys: Medusa's product sync (vewao-clients#32 or later).
    useAPIKey: true,
    // The admin is on the shop's domain: lock an account after repeated failures.
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    cookies: { secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' },
  },
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
      ],
    },
  ],
}
