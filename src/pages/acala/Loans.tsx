import React from 'react'
import { observer } from 'mobx-react'
import { Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import Big from 'big.js'
import { StorageType as AcalaStorageType } from '@acala-network/types'

import { useApi } from '../../hooks'
import { FormatBalance, FormatPercent } from '../../components/Format'
import { getDexPrice, getOraclePrice } from '../../helpers'
import { collateralToUSD, calcCollateralRatio, debitToUSD, Fixed18 } from '@acala-network/app-util';


type RecordType = {
  key: string;
  address: string;
  currencyId: string;
  debit: number;
  debitUSD: number;
  collateral: number;
  collateralUSD: number;
  collateralRatio: number;
}

const columns: ColumnsType<RecordType> = [
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  },
  {
    title: 'Currency',
    dataIndex: 'currencyId',
    key: 'currencyId',
  },
  {
    title: 'Debit',
    dataIndex: 'debit',
    key: 'debit',
    sorter: (a, b) => a.debit - b.debit,
    render: value => <FormatBalance value={value} suffix="aUSD" />
  },
  {
    title: 'Debit USD',
    dataIndex: 'debitUSD',
    key: 'debitUSD',
    sorter: (a, b) => a.debitUSD - b.debitUSD,
    render: value => <FormatBalance value={value} prefix="$" />
  },
  {
    title: 'Collateral',
    dataIndex: 'collateral',
    key: 'collateral',
    sorter: (a, b) => a.collateral - b.collateral,
    render: value => <FormatBalance value={value} />
  },
  {
    title: 'Collateral USD',
    dataIndex: 'collateralUSD',
    key: 'collateralUSD',
    sorter: (a, b) => a.collateralUSD - b.collateralUSD,
    render: value => <FormatBalance value={value} prefix="$" />
  },
  {
    title: 'Collateral Ratio',
    dataIndex: 'collateralRatio',
    key: 'collateralRatio',
    sorter: (a, b) => a.collateralRatio - b.collateralRatio,
    render: value => <FormatPercent value={value} />
  }
]

const Loans = () => {
  const { api, storage } = useApi()

  const acala = storage as AcalaStorageType

  let totalDebits = new Big(0)
  let totalCollateralValue = new Big(0)
  const data: Record<string, any> = {}

  for (const [currency, val] of acala.cdpEngine.debitExchangeRate.entries().entries()) {
    data[currency] = { rate: val.toString(), collaterals: '0', debits: '0', price: getDexPrice(acala, currency) }
  }

  for (const [currency, position] of acala.loans.totalPositions.entries().entries()) {
    const collaterals = position.collateral.toString()
    const collateralValue = new Big(collaterals).mul(data[currency].price)
    data[currency].collaterals = collaterals
    data[currency].collateralValue = collateralValue
    totalCollateralValue = totalCollateralValue.add(collateralValue)

    const debits = new Big(position.debit.toString()).mul(data[currency].rate).div(1e18)
    totalDebits = totalDebits.add(debits)
    data[currency].debits = debits.toString()
  }

  console.log(data);

  const dataSource: RecordType[] = [];
  const stableCurrencyId = api.consts.cdpTreasury.getStableCurrencyId.toString();

  for (const [currencyId, value] of acala.loans.positions.allEntries().entries()) {
    for (const [account, position] of value.entries()) {
      if (position.collateral.toString() === '0') continue;

      const debitExchangeRate = acala.cdpEngine.debitExchangeRate(currencyId as any)
      const exchangeRate = debitExchangeRate?.isSome
        ? debitExchangeRate.unwrap()
        : api.consts.cdpEngine.defaultDebitExchangeRate

      const collateralPrice = getOraclePrice(acala)(currencyId);
      const stableCoinPrice = getOraclePrice(acala)(stableCurrencyId);

      if (!collateralPrice || !stableCoinPrice) continue

      const collateralUSD = collateralToUSD(new Fixed18(position.collateral.toString()), new Fixed18(collateralPrice));
      const debitsUSD = debitToUSD(
        new Fixed18(position.debit.toString()),
        new Fixed18(exchangeRate.toString()),
        new Fixed18(stableCoinPrice)
      )

      const collateralRatio = calcCollateralRatio(collateralUSD, debitsUSD)
      dataSource.push({
        key: `${account}.${currencyId}`,
        address: account,
        currencyId,
        debit: Number(Big(position.debit.toString()).mul(Big(exchangeRate.toString())).div(1e18).toString()),
        debitUSD: debitsUSD.innerToNumber(),
        collateral: Number(position.collateral.toString()),
        collateralUSD: collateralUSD.innerToNumber(),
        collateralRatio: collateralRatio.toNumber(),
      })
    }
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
      <Table columns={columns} dataSource={dataSource}/>
    </div>
  )
}

export default observer(Loans)
