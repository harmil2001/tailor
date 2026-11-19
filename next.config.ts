import fs from 'node:fs'
import path from 'node:path'
import type { NextConfig } from 'next'

// Which shop this build is for. Defaults to Dhaaga, so nothing needs to be set for it.
const shopId = (process.env.SHOP_ID ?? 'dhaaga').trim()

if (!/^[a-z0-9-]+$/.test(shopId)) {
  throw new Error(`SHOP_ID "${shopId}" may only use lowercase letters, numbers and dashes.`)
}

const shopFile = `./src/config/shops/${shopId}.ts`
if (!fs.existsSync(path.join(process.cwd(), shopFile))) {
  throw new Error(`SHOP_ID "${shopId}" has no settings file. Create ${shopFile} (copy dhaaga.ts as a starting point).`)
}

const nextConfig: NextConfig = {
  // "@shop-config" resolves to the chosen shop's file, so only that shop is bundled.
  turbopack: {
    resolveAlias: { '@shop-config': shopFile },
  },
  // Same alias for `next dev --webpack` / `next build --webpack`.
  webpack(config) {
    config.resolve.alias['@shop-config'] = path.resolve(process.cwd(), shopFile)
    return config
  },
}

export default nextConfig
