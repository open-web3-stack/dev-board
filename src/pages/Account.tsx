import React, { useState, useCallback } from 'react'
import { observer } from 'mobx-react'
import { Form, Input } from 'antd'

import { useApi } from '../hooks'
import { FormatBalance } from '../components/Format'
import { currencyIds, getBalance } from '../helpers'

const { Item } = Form

const Loans = () => {
  const { storage, network } = useApi()
  const [address, setAddress] = useState<string>()
  const onInputChange = useCallback((e) => setAddress(e.target.value), [setAddress])

  return (
    <div className="comp-account">
      <Form>
        <Item name="address" label="Address">
          <Input value={address} onChange={onInputChange}/>
        </Item>
      </Form>
      {
        <table>
          <tbody>
            {
              currencyIds[network].map(c => (
                <tr key={c}>
                  <th>{c}</th>
                  <td><FormatBalance value={getBalance(storage, address!, c)?.toString()} /></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      }

    </div>
  )
}

export default observer(Loans)
