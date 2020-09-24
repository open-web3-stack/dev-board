import { StorageType as AcalaStorageType } from '@acala-network/types'
import { StorageType as LaminarStorageType } from '@laminar/types'
import Big from 'big.js'
import { decodeAddress } from '@polkadot/keyring'
import { computedFn } from 'mobx-utils'

export { default as sendTx } from './sendTx'

export const isAcalaStorage = (storage: any): storage is AcalaStorageType => {
  return !!storage.dex
}

export const getDexPrice = (storage: AcalaStorageType, c: string) => {
  let [a, b] = storage.dex.liquidityPool(c as any) || []
  if (!a || !b) {
    return '0'
  }
  if (a.eq(0)) {
    return '0'
  }
  return new Big(b.toString()).div(a.toString()).toString()
}

export const currencyIds = {
  acala: ['ACA', 'AUSD', 'DOT', 'LDOT', 'XBTC', 'RENBTC'],
  laminar: ['LAMI', 'AUSD', 'FAUD', 'FEUR', 'FJPY', 'FBTC', 'FETH', 'FCAD', 'FCHF', 'FXAU', 'FOIL'],
}

export const getBalance = (storage: AcalaStorageType | LaminarStorageType, account: string, currency: string) => {
  try {
    decodeAddress(account) // verify if it is valid. this will throw if account is not valid address
    if (currency === 'ACA' || currency === 'LAMI') {
      return storage.system.account(account)?.data?.free
    }
    return storage.tokens.accounts(account, currency as any)?.free
  } catch {
    return null
  }
}

const median = (arr: number[]): number => {
  const mid = Math.floor(arr.length / 2)
  const nums = [...arr].sort((a, b) => a - b)
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}

export const getOraclePrice = (storage: LaminarStorageType | AcalaStorageType) =>
  computedFn((tokenId: string) => {
    if (tokenId === 'AUSD') return 1e18
    const prices: number[] = []

    let rawValues
    if (isAcalaStorage(storage)) {
      const acalaValues = storage.acalaOracle.rawValues.allEntries()
      const bandValues = storage.bandOracle.rawValues.allEntries()
      rawValues = [...acalaValues.values(), ...bandValues.values()]
    } else {
      rawValues = storage.oracle.rawValues.allEntries().values()
    }

    for (const rawValue of rawValues) {
      for (const [key, price] of rawValue.entries()) {
        if (key === tokenId && price.isSome) {
          prices.push(Number(price.unwrap().value.toString()))
        }
      }
    }

    if (prices.length > 0) {
      return median(prices)
    }
    return null
  })
