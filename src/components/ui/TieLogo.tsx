const TieLogo = ({ size = 36 }: { size?: number }) => (
  <svg
    height={size}
    width={size}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    xmlSpace="preserve"
  >
    <path
      fill="#fed488"
      d="M12.4 8h7.2l1.6-3.1c.3-.6.3-1.4-.1-1.9s-1-1-1.7-1h-6.8c-.7 0-1.3.4-1.7.9s-.4 1.3-.1 1.9zm8.4 10H16c-.6 0-1-.4-1-1s.4-1 1-1h4.4l-1.2-6h-6.4l-2.6 12.8c-.2 1 .1 2 .8 2.7l3.5 3.5c.4.4.9.6 1.4.6s1-.2 1.4-.6l3.5-3.5c.7-.7 1-1.7.8-2.7z"
    />
  </svg>
)

export default TieLogo
