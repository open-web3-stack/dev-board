import React from 'react'
import Big from 'big.js'
import moment from 'moment'
import numbro from 'numbro'

export type FormatPriceProps = {
  value?: number | string | Big;
  prefix?: string;
  suffix?: string;
  isBase?: boolean;
}

export const FormatPrice: React.FC<FormatPriceProps> = ({ prefix = '$', value, suffix, isBase = true }) => (
  <span>{prefix}{Number.isNaN(value) ? 'NaN' : numbro(new Big(value || 0).div(isBase ? 1e18 : 1).valueOf()).format({
    thousandSeparated: true,
    trimMantissa: true,
    mantissa: 4
  })} {suffix}</span>
)

export const FormatBalance: React.FC<FormatPriceProps> = ({ prefix = '', value, suffix, isBase = true }) => (
  <FormatPrice {...{ prefix, value, suffix, isBase}} />
)

export const FormatPercent: React.FC<{ value: number | string | Big }> = ({ value }) => (
  <span>{numbro(value).format({ output: 'percent', mantissa: 2, trimMantissa: true })}</span>
)

export type FormatDateProps = {
  value?: number | string | Date;
}

export const FormatDate: React.FC<FormatDateProps> = ({ value }) => (
  <span>{moment.utc(value).local().format('YYYY-MM-DD HH:mm:ss')}</span>
)
