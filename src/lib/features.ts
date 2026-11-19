// Feature switches, read from the shop's settings file (src/config/shops/<SHOP_ID>.ts).
// Set a value to `true` there to bring a module back: its tab, its Home section and
// its pages all follow the setting. Turning a module off never deletes its data.
import { SHOP } from '@/config'

export const FEATURES = SHOP.features
