import React from "react"

// Thin line icons that sit with quiche-sans. Decorative: give the control, not
// the icon, its accessible name.

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </Icon>
  )
}

export function BagIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </Icon>
  )
}

/**
 * The cart's bag with a plus overlapping its lower right side (vewao-clients#75).
 * The bag is masked where the plus sits, so the lines do not cross.
 */
export function BagPlusIcon(props: IconProps) {
  const mask = `bag-plus-${React.useId().replace(/:/g, "")}`
  return (
    <Icon {...props}>
      <defs>
        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
          <rect width="24" height="24" fill="white" />
          <circle cx="18" cy="18" r="5.5" fill="black" />
        </mask>
      </defs>
      <g mask={`url(#${mask})`}>
        <path d="M4 7.5h13l-.9 11.5H4.9L4 7.5Z" />
        <path d="M7.5 7.5V6a3 3 0 0 1 6 0v1.5" />
      </g>
      <circle cx="18" cy="18" r="4.25" />
      <path d="M18 16v4M16 18h4" />
    </Icon>
  )
}

export function MinusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 12h12" />
    </Icon>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </Icon>
  )
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Icon>
  )
}

export function ChevronIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m7 10 5 5 5-5" />
    </Icon>
  )
}

export function PhoneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 4h3l1.5 4-2 1.5a10 10 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4.5 6a2 2 0 0 1 2-2Z" />
    </Icon>
  )
}
