import { SHOP } from '@/config'

// The shop's logo mark, drawn to sit on a `bg-brand` circle. Which mark to show comes
// from the shop's settings file (logo: needle | monogram | image).
const BrandLogo = ({ size = 36 }: { size?: number }) => {
  const logo = SHOP.logo

  if (logo.type === 'image') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo.src} alt="" width={size} height={size} style={{ objectFit: 'contain' }} />
  }

  if (logo.type === 'monogram') {
    const letter = (logo.letter ?? [...SHOP.name][0] ?? '?').toUpperCase()
    return (
      <svg height={size} width={size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true">
        <text
          x="16" y="16"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="18"
          fontWeight="700"
          fill="var(--color-canvas)"
          style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
        >
          {letter}
        </text>
      </svg>
    )
  }

  // Dhaaga mark: a needle with a loop of thread.
  return (
    <svg
      height={size}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M23.4 7.2c7.4 6.8-14.6 6.2-13.4 12.8 1.1 6 11 2.6 12.2 7.4"
        stroke="var(--color-canvas)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="6.5" y1="27" x2="24.6" y2="5.6"
        stroke="var(--color-accent-soft)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <ellipse
        cx="22.6" cy="8" rx="0.8" ry="2.1"
        transform="rotate(40 22.6 8)"
        fill="var(--color-brand)"
      />
    </svg>
  )
}

export default BrandLogo
