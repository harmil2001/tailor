// Create an admin login, or change the name/password of an existing one.
// Usage: npm run db:set-login
// Everything is typed in the terminal, so no password ends up in a file or in git.
import { config } from 'dotenv'
config({ path: '.env.local' })

import { createInterface } from 'node:readline/promises'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { users } from './schema'

const MIN_PASSWORD_LENGTH = 8

async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try {
    return (await rl.question(question)).trim()
  } finally {
    rl.close()
  }
}

// Reads a line without echoing it, so the password is not left on screen.
function askHidden(question: string): Promise<string> {
  const stdin = process.stdin
  if (!stdin.isTTY) return ask(question)

  return new Promise((resolve, reject) => {
    process.stdout.write(question)
    let value = ''
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')

    const done = () => {
      stdin.setRawMode(false)
      stdin.pause()
      stdin.off('data', onData)
      process.stdout.write('\n')
    }

    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') { done(); return resolve(value) }
        if (ch === '\u0003') { done(); return reject(new Error('Cancelled')) }
        if (ch === '\u007f' || ch === '\b') { value = value.slice(0, -1); continue }
        value += ch
      }
    }
    stdin.on('data', onData)
  })
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing from .env.local')
  }
  const db = drizzle(neon(process.env.DATABASE_URL))

  const existing = await db.select({ name: users.name, email: users.email }).from(users)
  console.log('\nCurrent logins:')
  if (existing.length === 0) console.log('  (none)')
  for (const u of existing) console.log(`  ${u.email}  (${u.name})`)
  console.log('')

  const email = (await ask('Login email: ')).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('That is not a valid email address')

  const current = existing.find(u => u.email.toLowerCase() === email)
  const name = (await ask(`Name${current ? ` [${current.name}]` : ''}: `)) || current?.name || ''
  if (!name) throw new Error('Name is required')

  const password = await askHidden(`New password (min ${MIN_PASSWORD_LENGTH} characters, hidden): `)
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  }
  const confirm = await askHidden('Type it again: ')
  if (password !== confirm) throw new Error('The two passwords do not match')

  const passwordHash = await bcrypt.hash(password, 12)

  if (current) {
    await db.update(users).set({ name, passwordHash }).where(eq(users.email, current.email))
    console.log(`\n✓ Updated ${current.email}`)
  } else {
    await db.insert(users).values({ name, email, passwordHash })
    console.log(`\n✓ Created ${email}`)
  }

  // Offer to remove other logins (for example the default seed account).
  const others = existing.filter(u => u.email.toLowerCase() !== email)
  for (const other of others) {
    const answer = (await ask(`Remove the login ${other.email}? (y/N): `)).toLowerCase()
    if (answer === 'y' || answer === 'yes') {
      await db.delete(users).where(eq(users.email, other.email))
      console.log(`✓ Removed ${other.email}`)
    }
  }

  console.log('\nDone. Sign in with the new email and password.')
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(`\n✗ ${err instanceof Error ? err.message : err}`)
    process.exit(1)
  })
