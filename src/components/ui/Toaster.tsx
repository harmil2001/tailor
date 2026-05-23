'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: 'var(--font-poppins), sans-serif',
          fontSize: '14px',
          borderRadius: '12px',
        },
      }}
    />
  )
}
