"use server"

import { sdk } from "@lib/config"

export type WithdrawalInput = {
  order_reference: string
  customer_name: string
  email: string
  items: string
}

export type WithdrawalReceipt = {
  id: string
  statement: string
  submitted_at: string
  email: string
}

export type WithdrawalResult =
  | { ok: true; withdrawal: WithdrawalReceipt }
  | { ok: false; invalid: boolean }

/**
 * Submits the confirmed withdrawal statement to the platform's withdrawal
 * function (vewao-platform `POST /store/withdrawals`). Called only after the
 * customer has reviewed and confirmed it, hence `confirmed: true`.
 */
export async function submitWithdrawal(input: WithdrawalInput): Promise<WithdrawalResult> {
  try {
    const { withdrawal } = await sdk.client.fetch<{ withdrawal: WithdrawalReceipt }>(
      "/store/withdrawals",
      {
        method: "POST",
        body: { ...input, items: input.items.trim() || null, confirmed: true },
        cache: "no-store",
      }
    )
    return { ok: true, withdrawal }
  } catch (error) {
    const status = (error as { status?: number }).status
    return { ok: false, invalid: status === 400 }
  }
}
