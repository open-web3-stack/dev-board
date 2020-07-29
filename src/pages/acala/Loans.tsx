import React from 'react'
import { observer } from 'mobx-react'
import { Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import Big from 'big.js'
import { StorageType as AcalaStorageType } from '@acala-network/types'

import { useApi } from '../../hooks'
import { FormatBalance, FormatPercent } from '../../components/Format'
import { getDexPrice } from '../../helpers'

type RecordType = {
  address: string;
}

const columns: ColumnsType<RecordType> = [
  {
    title: 'Address',
    key: 'address'
  }
]

const Loans = () => {
  const { storage } = useApi()

  const acala = storage as AcalaStorageType

  let totalDebits = new Big(0)
  let totalCollateralValue = new Big(0)
  const data: Record<string, any> = {}

  for (const [currency, val] of acala.cdpEngine.debitExchangeRate.entries().entries()) {
    data[currency] = { rate: val.toString(), collaterals: '0', debits: '0', price: getDexPrice(acala, currency) }
  }

  for (const [currency, val] of acala.loans.totalCollaterals.entries().entries()) {
    const collaterals = val.toString()
    const collateralValue = new Big(collaterals).mul(data[currency].price)
    data[currency].collaterals = collaterals
    data[currency].collateralValue = collateralValue
    totalCollateralValue = totalCollateralValue.add(collateralValue)
  }

  for (const [currency, val] of acala.loans.totalDebits.entries().entries()) {
    const debits = new Big(val.toString()).mul(data[currency].rate).div(1e18)
    totalDebits = totalDebits.add(debits)
    data[currency].debits = debits.toString()
  }

  return (
    <div className="comp-loans">
      <table className="overall">
        <thead>
          <tr>
            <th>Currency</th>
            <th>Total Collateral</th>
            <th>Total Debit</th>
            <th>Collateral Value</th>
            <th>Collateral Ratio</th>
          </tr>
        </thead>
        <tbody>
        {
          Object.entries(data).map(([c, { collaterals, debits, collateralValue }]) => (
            <tr key={c}>
              <th>{c}</th>
              <td><FormatBalance value={collaterals} /></td>
              <td><FormatBalance value={debits} prefix='$'/></td>
              <td><FormatBalance value={collateralValue} prefix='$'/></td>
              <td><FormatPercent value={collateralValue?.div(+debits || 1)}/> </td>
            </tr>
          ))
        }
        <tr>
          <th>Total</th>
          <td></td>
          <td><FormatBalance value={totalDebits} prefix='$'/></td>
          <td><FormatBalance value={totalCollateralValue} prefix='$'/></td>
          <td><FormatPercent value={totalCollateralValue?.div(+totalDebits || 1)}/> </td>
        </tr>
        </tbody>
      </table>
      <Table columns={columns}/>
    </div>
  )
}

export default observer(Loans)
