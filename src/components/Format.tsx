import React from 'react'
import Big from 'big.js'
import moment from 'moment'

export type FormatPriceProps = {
  value?: number | string | Big;
  symbol?: string;
  isBase?: boolean
}

export const FormatPrice: React.FC<FormatPriceProps> = ({ value, symbol, isBase = true }) => (
  <span>${Number.isNaN(value) ? 'NaN' : new Big(value || 0).div(isBase ? 1e18 : 1).round(4).toString()} {symbol}</span>
)

export type FormatDateProps = {
  value?: number | string | Date;
}

export const FormatDate: React.FC<FormatDateProps> = ({ value }) => (
  <span>{moment.utc(value).local().format('YYYY-MM-DD HH:mm:ss')}</span>
)
