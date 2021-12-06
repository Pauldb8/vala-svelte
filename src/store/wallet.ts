import { writable as persistentWritable, derived as persistentDerived } from "svelte-persistent-store/dist/local"
import { writable, readable, derived, Readable } from "svelte/store"
import { bsv } from "bitcoin-predict"
import Mnemonic from "../utils/mnemonic"
import { testnet } from "../config"
import { getUtxos } from "../utils/utxo"
import { price } from "./price"
import { fetchUTXOs } from "../apis/whatsonchain"
import writableDerived from "svelte-writable-derived"

// console.log(Mnemonic)

export const derivationPath = "m/44'/0'/0'/0/0"

export let seed = persistentWritable("seed", null)

export let hdPrivateKey = derived(
  seed,
  seed => {
    return seed ? Mnemonic.fromString(seed).toHDPrivateKey("", testnet ? "testnet" : "livenet") : null
  },
  null
)

export let privateKey = derived(
  hdPrivateKey,
  hdPrivateKey => {
    return hdPrivateKey ? hdPrivateKey.deriveChild(derivationPath).privateKey : null
  },
  null
)

export let publicKey = derived(
  privateKey,
  privateKey => {
    return privateKey ? privateKey.publicKey : null
  },
  null
)

export let address = derived(
  privateKey,
  privateKey => {
    return privateKey ? privateKey.toAddress() : null
  },
  null
)

export let fetchedUtxos = derived(
  address,
  ($address, set) => {
    // Periodically fetch UTXOs from whatsonchain
    async function fetchUtxos() {
      if ($address) {
        const utxos = await fetchUTXOs($address.hashBuffer.toString("hex"), testnet)

        // Add new, not yet seen outputs to store
        outputs.update(outs => {
          for (const utxo of utxos) {
            const path = utxo.txId + "/" + utxo.outputIndex
            if (!outs[path]) {
              outs[path] = {
                txId: utxo.txId,
                outputIndex: utxo.outputIndex,
                spent: false,
                script: utxo.script,
                satoshis: utxo.satoshis
              }
            }
          }

          return outs
        })
      }
    }

    const interval = setInterval(fetchUtxos, 3000)

    return function stop() {
      clearInterval(interval)
    }
  },
  null
)

export let outputs = persistentWritable("outputs", {}, set => {
  // Required to start periodic fetching
  fetchedUtxos.subscribe(_ => {})
})

export let utxos = derived(
  outputs,
  $outputs => Object.values($outputs).filter(output => !output.spent),
  // .map(output => {
  //   return { ...output, script: bsv.Script.fromHex(output.script) }
  // })
  []
)

export let satBalance = derived(
  utxos,
  $utxos => {
    return $utxos.reduce((sats, output) => output.satoshis + sats, 0)
  },
  0
)

export let usdBalance = derived(
  [satBalance, price],
  ([$satBalance, $price]) => {
    return ($price * $satBalance) / 100000000
  },
  0
)
