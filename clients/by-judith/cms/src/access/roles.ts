import type { Access, FieldAccess } from 'payload'

export type Role = 'admin' | 'editor' | 'medusa' | 'storefront'

type WithRoles = { roles?: Role[] | null } | null | undefined

export const hasRole = (user: WithRoles, ...roles: Role[]) =>
  Boolean(user?.roles?.some((role) => roles.includes(role)))

/** Merchant staff who edit content. */
export const isEditor: Access = ({ req }) => hasRole(req.user, 'admin', 'editor')
export const isAdmin: Access = ({ req }) => hasRole(req.user, 'admin')
/** Medusa's sync integration (API key user). */
export const isMedusa: Access = ({ req }) => hasRole(req.user, 'medusa')

/**
 * Published documents are public. Drafts only for editors and the storefront's
 * preview reader (API key user, used server-side in Next.js draft mode).
 */
export const publishedOrPreview: Access = ({ req }) => {
  if (hasRole(req.user, 'admin', 'editor', 'storefront')) return true
  return { _status: { equals: 'published' } }
}

export const editorField: FieldAccess = ({ req }) => hasRole(req.user, 'admin', 'editor')
export const medusaField: FieldAccess = ({ req }) => hasRole(req.user, 'medusa')
