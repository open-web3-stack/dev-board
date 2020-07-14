import React, { useCallback, useState } from 'react'
import { observer } from 'mobx-react'
import { InputNumber, Button } from 'antd'
import Big from 'big.js'

import { useApi, useAccounts } from '../hooks'
import { FormatPrice, FormatDate } from '../components/Format'
import sendTx from '../helpers/sendTx'
import { StorageType as AcalaStorageType } from '@acala-network/types'


type OraclePriceRowProps = {
  i: number;
  value: string;
  timestamp: number;
  onUpdate: (val: number) => void;
  hasSudo: boolean;
}

const OraclePriceRow: React.FC<OraclePriceRowProps> = ({hasSudo, i, value, timestamp, onUpdate}) => {
  const [val, setVal] = useState<number>(+value / 1e18)
  const updateCallback = useCallback(() => val && onUpdate(val * 1e18), [val, onUpdate])

  return (
    <>
      <th>Operator {i}</th>
      <td><FormatPrice value={value} /></td>
      <td><FormatDate value={timestamp} /></td>
      {hasSudo && <>
        <td><InputNumber defaultValue={+value / 1e18} value={val} onChange={setVal as any} /></td>
        <td><Button onClick={updateCallback}>Update</Button></td>
      </>}
    </>
  )
}

const isAcalaStorage = (storage: any): storage is AcalaStorageType => {
  return !!storage.dex;
}

const getDexPrice = (storage: AcalaStorageType, c: string) => {
  let [a, b] = storage.dex.liquidityPool(c as any) || []
  if (!a || !b) {
    return NaN
  }
  return Number(b.toString()) / Number(a.toString())
}

const Prices = () => {
  const { api, storage, network } = useApi()
  const { accounts, activeAccount } = useAccounts()

  const sudoKey = storage.sudo.key?.toString()
  const sudoAcccount = accounts.find(a => a.address === sudoKey)
  const hasSudo = sudoAcccount !== undefined

  const feedOracle = useCallback((data) => {
    activeAccount(sudoAcccount!.address)
    sendTx(
      sudoAcccount!.address,
      api.tx.sudo.sudo(
        api.tx.oracle.feedValues([[data.currency, new Big(data.price).toFixed()]], data.index || 0, 0, '0x')
      )
    )
  }, [api, sudoAcccount, activeAccount])

  const currencies = network === 'acala' ? ['ACA', 'DOT', 'XBTC'] : ['FAUD', 'FEUR', 'FJPY', 'FBTC', 'FETH', 'FCAD', 'FCHF', 'FXAU', 'FOIL']

  const rawValues = storage.oracle.rawValues.allEntries()
  const values: Record<string, Array<{ address: string, value: string, timestamp: number }>> = {}

  for (const [addr, value] of Array.from(rawValues.entries())) {
    for (const [key, rawVal] of Array.from(value.entries())) {
      values[key] = values[key] || []
      values[key].push({ address: addr.toString(), value: rawVal.unwrapOrDefault().value.toString(), timestamp: rawVal.unwrapOrDefault().timestamp.toNumber() })
    }
  }

  return (
    <table className="comp-prices">
      <thead>
        <tr>
          <th></th>
          <th></th>
          <th>Price</th>
          <th>Updated At</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
      {
        currencies.map(c => (
          <React.Fragment key={c}>
            <tr>
              <th>{c}</th>
            </tr>
            {
              (values[c] || []).map((v, i) => (
                <tr key={v.address}>
                  <th></th>
                  <OraclePriceRow hasSudo={hasSudo} i={i} value={v.value} timestamp={v.timestamp} onUpdate={v => feedOracle({ price: v, currency: c, index: i })}/>
                </tr>
              ))
            }
            {isAcalaStorage(storage) &&
              <tr>
                <th></th>
                <th>DEX</th>
                <td><FormatPrice value={getDexPrice(storage, c)} isBase={false} /></td>
              </tr>
            }
          </React.Fragment>
        ))
      }
      </tbody>
    </table>
  )
}

export default observer(Prices)
