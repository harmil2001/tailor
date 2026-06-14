const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

export function fmtINR(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 10_000_000) return `₹${(abs / 10_000_000).toFixed(2).replace(/\.?0+$/, '')}Cr`
  if (abs >= 100_000)    return `₹${(abs / 100_000).toFixed(2).replace(/\.?0+$/, '')}L`
  return `₹${inr.format(abs)}`
}
