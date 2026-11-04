import "server-only"

import {
  getContentItem,
  listContentItems,
  type ContentImage,
  type ContentItem,
  type ImageMetadata,
} from "@lib/data/content"
import { byOrder } from "@lib/util/clinic"

/**
 * Clinic content collections (see seed/import-clinic.ts): page texts and the
 * team. Procedures moved to the Payload CMS (#43, lib/data/procedures).
 */

type Ordered = { poradi?: number | null }

export type Page = ContentItem<ImageMetadata & { perex?: string | null; gallery?: ContentImage[] }>
export type TeamMember = ContentItem<
  ImageMetadata & Ordered & { role?: string | null; kvalifikace?: string | null; pismeno?: string | null }
>
type Meta<T extends ContentItem<object>> = NonNullable<T["metadata"]>

export const getPage = (slug: string) => getContentItem<Meta<Page>>("stranky", slug)

export const listTeam = async () => byOrder(await listContentItems<Meta<TeamMember>>("tym"))
