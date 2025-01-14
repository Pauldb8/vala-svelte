import { writable as persistentWritable } from "svelte-persistent-store/dist/local"

export const resolve = persistentWritable("new_market_resolve", null)
export const details = persistentWritable("new_market_details", null)
export const options = persistentWritable("new_market_options", [])
export const creatorFee = persistentWritable("new_market_creatorfee", null)
export const liquidityFee = persistentWritable("new_market_liquidityfee", null)

export function reset() {
  resolve.set(null)
  details.set(null)
  options.set([])
  creatorFee.set(null)
  liquidityFee.set(null)
}
