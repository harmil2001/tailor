// The active shop's settings.
//
// `@shop-config` is a build-time alias (see next.config.ts) that points at
// src/config/shops/<SHOP_ID>.ts, so only the chosen shop's file is bundled.
// SHOP_ID defaults to "dhaaga". Settings are fixed when the app is built:
// changing them means a redeploy.
import shop from '@shop-config'
import { resolveTheme, themeOverrideStyle } from './theme'
import { checkShop } from './validate'

const { errors } = checkShop(shop)
if (errors.length > 0) {
  throw new Error(`Invalid shop settings for "${shop.id}":\n- ${errors.join('\n- ')}`)
}

export const SHOP = shop

/** Every colour, with this shop's overrides applied. Use this where literal hex is needed (PDF, canvas). */
export const THEME = resolveTheme(shop.theme)

/** CSS variables for the <html> element. Empty for shops that keep the default palette. */
export const THEME_STYLE = themeOverrideStyle(shop.theme)
