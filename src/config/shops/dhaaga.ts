import { defineShop } from '../types'

// Dhaaga — the default shop. It is used whenever SHOP_ID is not set,
// and it reproduces the app's original look and behaviour exactly.
export default defineShop({
  id: 'dhaaga',
  name: 'Dhaaga',
  tagline: 'Clothing & Tailoring',
  logo: { type: 'needle' },
  features: {
    dealers: false,
    stock: false,
    clothChoice: false,
  },
  // No theme overrides: Dhaaga uses the default soft slate palette.
})
