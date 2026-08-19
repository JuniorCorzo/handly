import type { FC, SVGProps } from 'react'
import type { UrgencyLevel } from '@/lib/validations/need-item'
import { URGENCY_META } from '@/features/campaign/lib/urgency'

const svg: SVGProps<SVGSVGElement> = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  strokeWidth: 1.75,
  stroke: 'currentColor'
}

export const CriticalIcon: FC = () => (
  <svg {...svg} aria-hidden='true'>
    <polygon points='12 2 15 10 22 10 13 14 16 22 12 17 8 22 5 10 2 10 9 10' />
  </svg>
)

export const UrgentIcon: FC = () => (
  <svg {...svg} aria-hidden='true'>
    <circle cx='12' cy='12' r='9' />
    <path d='M12 7v5l3 3' />
  </svg>
)

export const StandardIcon: FC = () => (
  <svg {...svg} aria-hidden='true'>
    <rect x='3' y='5' width='18' height='16' rx='2' />
    <path d='M7 9h1M11 9h1M15 9h1' />
  </svg>
)

export const MapPinIcon: FC = () => (
  <svg
    width={12}
    height={12}
    viewBox='0 0 24 24'
    fill='none'
    strokeWidth={1.75}
    stroke='currentColor'
    aria-hidden='true'
  >
    <path d='M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 1 1 18 0z' />
    <circle cx='12' cy='10' r='3' />
  </svg>
)

interface UrgencyIconProps {
  urgency: UrgencyLevel
}

export function UrgencyIcon({ urgency }: UrgencyIconProps) {
  const token = URGENCY_META[urgency].token
  switch (token) {
    case 'critical':
      return <CriticalIcon />
    case 'urgent':
      return <UrgentIcon />
    default:
      return <StandardIcon />
  }
}
