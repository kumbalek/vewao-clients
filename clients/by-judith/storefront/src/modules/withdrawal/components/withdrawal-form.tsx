"use client"

import React, { useEffect, useRef, useState } from "react"

import { contact } from "content/site"
import {
  submitWithdrawal,
  type WithdrawalInput,
  type WithdrawalReceipt,
} from "@lib/data/withdrawal"
import { Button, Card, Heading, Text } from "@modules/design-system"

type Step = "edit" | "review" | "done"
type Errors = Partial<Record<keyof WithdrawalInput, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const dateTime = new Intl.DateTimeFormat("cs-CZ", {
  dateStyle: "long",
  timeStyle: "medium",
  timeZone: "Europe/Prague",
})

export function validateWithdrawal(values: WithdrawalInput): Errors {
  const errors: Errors = {}
  if (!values.order_reference.trim()) errors.order_reference = "Vyplňte číslo objednávky."
  if (!values.customer_name.trim()) errors.customer_name = "Vyplňte jméno a příjmení."
  if (!EMAIL.test(values.email.trim())) errors.email = "Vyplňte platný e-mail."
  return errors
}

const fieldClasses =
  "w-full rounded-card border border-line bg-white px-5 py-3 text-base text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink aria-[invalid=true]:border-danger"

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: React.ReactElement<React.InputHTMLAttributes<HTMLElement>>
}) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ")
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm text-ink">
        {label}
      </label>
      {React.cloneElement(children, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}
      {hint && (
        <Text id={`${id}-hint`} size="xs" tone="muted">
          {hint}
        </Text>
      )}
      {error && (
        <Text id={`${id}-error`} size="xs" className="text-danger">
          {error}
        </Text>
      )}
    </div>
  )
}

/**
 * The withdrawal function (§ 1830a občanského zákoníku): the customer fills in
 * the order and their details, reviews them and confirms. Only the confirmation
 * submits; the backend records the statement and e-mails an acknowledgment.
 */
export default function WithdrawalForm({ initial }: { initial?: Partial<WithdrawalInput> }) {
  const [step, setStep] = useState<Step>("edit")
  const [values, setValues] = useState<WithdrawalInput>({
    order_reference: "",
    customer_name: "",
    email: "",
    items: "",
    ...initial,
  })
  const [errors, setErrors] = useState<Errors>({})
  const [failure, setFailure] = useState<"invalid" | "error" | null>(null)
  const [pending, setPending] = useState(false)
  const [receipt, setReceipt] = useState<WithdrawalReceipt | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [step])

  const set = (key: keyof WithdrawalInput) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((current) => ({ ...current, [key]: event.target.value }))

  const review = (event: React.FormEvent) => {
    event.preventDefault()
    const found = validateWithdrawal(values)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      document.getElementById(`withdrawal-${first}`)?.focus()
      return
    }
    setFailure(null)
    setStep("review")
  }

  const confirm = async () => {
    setPending(true)
    setFailure(null)
    const result = await submitWithdrawal(values)
    setPending(false)
    if (result.ok) {
      setReceipt(result.withdrawal)
      setStep("done")
    } else {
      setFailure(result.invalid ? "invalid" : "error")
    }
  }

  if (step === "done" && receipt) {
    return (
      <Card tone="surface" className="flex flex-col gap-4" data-testid="withdrawal-done">
        <Heading level={2} size="md" ref={headingRef} tabIndex={-1} className="focus:outline-none">
          Odstoupení od smlouvy jsme přijali
        </Heading>
        <Text>
          Přijato {dateTime.format(new Date(receipt.submitted_at))}. Potvrzení s úplným zněním
          jsme poslali na {receipt.email}.
        </Text>
        <Text as="div" size="sm" tone="subtle" className="whitespace-pre-line rounded-popover bg-white p-5">
          {receipt.statement}
        </Text>
        <Text size="sm" tone="subtle">
          O dalším postupu, včetně vrácení zboží a peněz, vás budeme informovat.
        </Text>
      </Card>
    )
  }

  if (step === "review") {
    return (
      <Card tone="surface" className="flex flex-col gap-6" data-testid="withdrawal-review">
        <Heading level={2} size="md" ref={headingRef} tabIndex={-1} className="focus:outline-none">
          Zkontrolujte a potvrďte odstoupení
        </Heading>
        <dl className="grid gap-x-6 gap-y-3 text-sm xsmall:grid-cols-[max-content_1fr]">
          <dt className="text-ink-subtle">Číslo objednávky</dt>
          <dd>{values.order_reference.trim()}</dd>
          <dt className="text-ink-subtle">Zboží</dt>
          <dd className="whitespace-pre-line">{values.items.trim() || "celá objednávka"}</dd>
          <dt className="text-ink-subtle">Jméno a příjmení</dt>
          <dd>{values.customer_name.trim()}</dd>
          <dt className="text-ink-subtle">E-mail</dt>
          <dd>{values.email.trim()}</dd>
        </dl>
        <Text size="sm" tone="subtle">
          Potvrzením odstoupíte od kupní smlouvy. Potvrzení o přijetí vám pošleme e-mailem.
        </Text>
        {failure && (
          <Text role="alert" size="sm" className="text-danger">
            {failure === "invalid"
              ? "Údaje se nepodařilo zpracovat. Upravte je a zkuste to znovu."
              : `Odeslání se nezdařilo. Zkuste to prosím znovu, nebo nám napište na ${contact.email}.`}
          </Text>
        )}
        <div className="flex flex-col gap-3 xsmall:flex-row">
          <Button size="lg" isLoading={pending} onClick={confirm}>
            Potvrdit odstoupení od smlouvy
          </Button>
          <Button size="lg" variant="secondary" disabled={pending} onClick={() => setStep("edit")}>
            Upravit údaje
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <form noValidate onSubmit={review} className="flex flex-col gap-6" data-testid="withdrawal-form">
      <Heading level={2} size="md" ref={headingRef} tabIndex={-1} className="focus:outline-none">
        Údaje o objednávce
      </Heading>
      <Field id="withdrawal-order_reference" label="Číslo objednávky" hint="Najdete ho v potvrzení objednávky." error={errors.order_reference}>
        <input className={fieldClasses} value={values.order_reference} onChange={set("order_reference")} autoComplete="off" required />
      </Field>
      <Field id="withdrawal-customer_name" label="Jméno a příjmení" error={errors.customer_name}>
        <input className={fieldClasses} value={values.customer_name} onChange={set("customer_name")} autoComplete="name" required />
      </Field>
      <Field id="withdrawal-email" label="E-mail" hint="Použijte e-mail z objednávky, pošleme na něj potvrzení." error={errors.email}>
        <input className={fieldClasses} type="email" value={values.email} onChange={set("email")} autoComplete="email" required />
      </Field>
      <Field id="withdrawal-items" label="Zboží, kterého se odstoupení týká (nepovinné)" hint="Nevyplníte-li, odstupujete od celé objednávky.">
        <textarea className={`${fieldClasses} min-h-[6rem]`} value={values.items} onChange={set("items")} maxLength={2000} />
      </Field>
      <div>
        <Button type="submit" size="lg">
          Pokračovat ke kontrole
        </Button>
      </div>
    </form>
  )
}
