import React from 'react'
import { Select } from 'antd'
import { useApi } from '../hooks'

const { Option } = Select

const CurrencySelect: React.FC = (props) => {
  const { network } = useApi()
  const currencies = network === 'acala' ? [
    'ACA', 'aUSD', 'DOT', 'XBTC'
  ] : [
    'LAMI', 'aUSD', 'fEUR', 'fJPY', 'fBTC', 'fETH', 'fAUD', 'fCAD', 'fCHF', 'fXAU', 'fOIL'
  ]
  return (
    <Select {...props}>
      {currencies.map(c => (
        <Option value={c} key={c}>{c}</Option>
      ))}
    </Select>
  )
}

export default CurrencySelect
