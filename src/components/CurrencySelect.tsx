import React from 'react'
import { Select } from 'antd'

const { Option } = Select

const CurrencySelect: React.FC = (props) => (
  <Select {...props}>
    <Option value="ACA">ACA</Option>
    <Option value="aUSD">aUSD</Option>
    <Option value="DOT">DOT</Option>
    <Option value="XBTC">XBTC</Option>
  </Select>
)

export default CurrencySelect
