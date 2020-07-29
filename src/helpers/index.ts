import { StorageType as AcalaStorageType } from '@acala-network/types'
import Big from 'big.js'

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
