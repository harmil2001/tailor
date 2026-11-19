// Dhaaga mark: a needle with a loop of thread. Colours come from the theme
// tokens in globals.css, and it is drawn to sit on a `bg-brand` circle.
const BrandLogo = ({ size = 36 }: { size?: number }) => (
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

export default BrandLogo
