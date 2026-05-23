'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-[#45464d] active:scale-95 transition-transform"
    >
      <ArrowLeft size={20} />
      <span className="text-[14px] font-medium">Back</span>
    </button>
  )
}
