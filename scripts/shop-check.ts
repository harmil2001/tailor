// Checks shop settings files and that the CSS colour tokens match the TypeScript defaults.
// Usage: npm run shop:check            (checks SHOP_ID, default "dhaaga")
//        npm run shop:check -- --all   (checks every file in src/config/shops)
//        npm run shop:check -- jiyajee (checks one shop)
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { DEFAULT_THEME } from '../src/config/theme'
import { checkShop } from '../src/config/validate'
import type { ShopConfig } from '../src/config/types'

const root = path.resolve(__dirname, '..')
const shopsDir = path.join(root, 'src/config/shops')
const args = process.argv.slice(2)

const ids = args.includes('--all')
  ? fs.readdirSync(shopsDir).filter(f => f.endsWith('.ts')).map(f => f.replace(/\.ts$/, ''))
  : [args.find(a => !a.startsWith('--')) ?? process.env.SHOP_ID ?? 'dhaaga']

let failed = false

// 1. The CSS copy of the default palette must match src/config/theme.ts
const css = fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf8')
const cssTokens = new Map<string, string>()
for (const [, name, value] of css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6});/g)) {
  cssTokens.set(name, value.toLowerCase())
}
const drift: string[] = []
for (const [name, value] of Object.entries(DEFAULT_THEME)) {
  const inCss = cssTokens.get(name)
  if (!inCss) drift.push(`${name}: missing from globals.css`)
  else if (inCss !== value.toLowerCase()) drift.push(`${name}: globals.css has ${inCss}, theme.ts has ${value}`)
}
for (const name of cssTokens.keys()) {
  if (!(name in DEFAULT_THEME)) drift.push(`${name}: in globals.css but not in theme.ts`)
}
if (drift.length) {
  failed = true
  console.log('✗ Colour tokens differ between src/app/globals.css and src/config/theme.ts:')
  drift.forEach(d => console.log(`    - ${d}`))
} else {
  console.log(`✓ Colour tokens match (${cssTokens.size} in globals.css and theme.ts)`)
}

// 2. Each shop file
async function main() {
  for (const id of ids) {
    const file = path.join(shopsDir, `${id}.ts`)
    if (!fs.existsSync(file)) {
      failed = true
      console.log(`✗ ${id}: no file at src/config/shops/${id}.ts`)
      continue
    }
    const shop = (await import(pathToFileURL(file).href)).default as ShopConfig
    const { errors, warnings } = checkShop(shop, id)
    if (errors.length) {
      failed = true
      console.log(`✗ ${id}`)
      errors.forEach(e => console.log(`    - ${e}`))
    } else {
      console.log(`✓ ${id}: "${shop.name}" · ${shop.tagline}`)
    }
    warnings.forEach(w => console.log(`    ! ${w}`))

    if (shop.logo.type === 'image' && !fs.existsSync(path.join(root, 'public', shop.logo.src))) {
      failed = true
      console.log(`    - logo file not found: public${shop.logo.src}`)
    }
    if (shop.favicon && !fs.existsSync(path.join(root, 'public', shop.favicon))) {
      failed = true
      console.log(`    - favicon file not found: public${shop.favicon}`)
    }
  }
  process.exit(failed ? 1 : 0)
}

main().catch(err => { console.error(err); process.exit(1) })
