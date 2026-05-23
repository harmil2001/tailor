'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { loginSchema } from '@/lib/validations'

export type LoginState = {
  success?: boolean
  fieldErrors?: { email?: string; password?: string }
  error?: string
} | null

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    const fieldErrors: { email?: string; password?: string } = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as 'email' | 'password'
      if (!fieldErrors[field]) fieldErrors[field] = issue.message
    }
    return { fieldErrors }
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Invalid email or password' }
    }
    throw error
  }
}
