import TieLogo from './TieLogo'
import ProfileSheet from './ProfileSheet'

interface TopBarProps {
  name: string
  email: string
}

export default function TopBar({ name, email }: TopBarProps) {
  return (
    <header className="fixed top-0 w-full z-50 h-[56px] bg-[#f8f9ff] border-b border-[#c6c6cd]">
      <div className="flex items-center justify-between px-4 w-full max-w-7xl mx-auto h-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center flex-shrink-0">
            <TieLogo size={22} />
          </div>
          <h1 className="text-[16px] font-bold text-[#0b1c30]" style={{ fontFamily: 'Manrope' }}>
            My Brothers
          </h1>
        </div>
        <ProfileSheet name={name} email={email} />
      </div>
    </header>
  )
}
