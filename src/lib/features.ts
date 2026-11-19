// Feature switches. Set a value to `true` to bring that module back:
// its tab, its Home section and its pages all follow this one setting.
// Turning a module off never deletes its data.
export const FEATURES: { dealers: boolean; stock: boolean; clothChoice: boolean } = {
  // Dealer accounts and ledger (/dealers)
  dealers: false,
  // Fabric stock (/inventory), low-stock alerts, and picking fabric "From Lot" on a new order
  stock: false,
  // The "Cloth: Customer / Tailor" choice on each order item. While off, the cloth
  // is always the customer's and new orders are saved as "Customer".
  clothChoice: false,
}
