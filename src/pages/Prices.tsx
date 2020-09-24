import React from 'react'
import { observer } from 'mobx-react'

import { useApi } from '../hooks'
import { FormatPrice, FormatDate } from '../components/Format'
import { isAcalaStorage, getDexPrice, currencyIds } from '../helpers'


type OraclePriceRowProps = {
  address: string;
  value: string;
  timestamp: number;
  provider: string;
}

const OraclePriceRow: React.FC<OraclePriceRowProps> = ({provider, address, value, timestamp}) => {
  return (
    <>
      <th>{provider}</th>
      <th className='operator-addr'>{address}</th>
      <td><FormatPrice value={value} /></td>
      <td><FormatDate value={timestamp} /></td>
    </>
  )
}

const Prices = () => {
  const { storage, network } = useApi()

  const currencies = currencyIds[network]

  let oracleValues

  if (isAcalaStorage(storage)) {
    const acalaValues = storage.acalaOracle.rawValues.allEntries()
    const bandValues = storage.bandOracle.rawValues.allEntries()
    oracleValues = [{ values: acalaValues.entries(), provider: 'Acala' }, { values: bandValues.entries(), provider: 'Band' }]
  } else {
    oracleValues = [{ values: storage.oracle.rawValues.allEntries().entries(), provider: 'laminar' }]
  }

  const values: Record<string, Array<{ provider: string, address: string, value: string, timestamp: number }>> = {}

  for (const { provider, values: rawValues } of oracleValues)
  for (const [addr, value] of rawValues) {
    for (const [key, rawVal] of value.entries()) {
      values[key] = values[key] || []
      values[key].push({
        provider, address: addr.toString(), value: rawVal.unwrapOrDefault().value.toString(), timestamp: rawVal.unwrapOrDefault().timestamp.toNumber()
      })
    }
  }

  return (
    <table className="comp-prices">
      <thead>
        <tr>
          <th></th>
          <th>Provider</th>
          <th>Operator</th>
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
                <tr key={i}>
                  <th></th>
                  <OraclePriceRow {...v} />
                </tr>
              ))
            }
            {isAcalaStorage(storage) &&
              <tr>
                <th></th>
                <th>DEX</th>
                <th></th>
                <td><FormatPrice value={c === 'AUSD' ? '1' : getDexPrice(storage, c)} isBase={false} /></td>
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
