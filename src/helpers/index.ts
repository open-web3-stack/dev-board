import { StorageType as AcalaStorageType } from '@acala-network/types'
import { StorageType as LaminarStorageType } from '@laminar/types'
import Big from 'big.js'
import { decodeAddress } from '@polkadot/keyring'

export { default as sendTx } from './sendTx'

export const isAcalaStorage = (storage: any): storage is AcalaStorageType => {
  return !!storage.dex
}

export const getDexPrice = (storage: AcalaStorageType, c: string) => {
  let [a, b] = storage.dex.liquidityPool(c as any) || []
  if (!a || !b) {
    return '0'
  }
  return new Big(b.toString()).div(a.toString()).toString()
}

export const currencyIds = {
  acala: ['ACA', 'DOT', 'LDOT', 'XBTC', 'RENBTC'],
  laminar: ['LAMI', 'FAUD', 'FEUR', 'FJPY', 'FBTC', 'FETH', 'FCAD', 'FCHF', 'FXAU', 'FOIL'],
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
