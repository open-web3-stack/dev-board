import React, { useCallback } from 'react'
import { observer } from 'mobx-react'
import { Form, Input, InputNumber, Button, Collapse, Select } from 'antd'
import Big from 'big.js'

import { useApi, useAccounts } from '../hooks'
import CurrencySelect from '../components/CurrencySelect'
import sendTx from '../helpers/sendTx'
import { isAcalaStorage } from '../helpers'

const { Item } = Form
const { Panel } = Collapse
const { Option } = Select

const Sudo = () => {
  const { api, storage } = useApi()
  const { accounts, activeAccount } = useAccounts()

  const sudoKey = storage.sudo.key?.toString()
  const sudoAcccount = accounts.find(a => a.address === sudoKey)
  const hasSudo = sudoAcccount !== undefined

  const updateCurrency = useCallback((data) => {
    activeAccount(sudoAcccount!.address)
    const amount = new Big(data.amount).mul(1e18).toFixed()
    sendTx(
      sudoAcccount!.address,
      api.tx.sudo.sudo(
        api.tx.currencies.updateBalance(data.address, data.currency, amount)
      ),
    )
  }, [api, sudoAcccount, activeAccount])

  const feedOraclue = useCallback((data) => {
    activeAccount(sudoAcccount!.address)
    const price = new Big(data.price).mul(1e18).toFixed()
    sendTx(
      sudoAcccount!.address,
      api.tx.sudo.sudo(
        api.tx[data.oracle].feedValues([[data.currency, price]])
      )
    )
  }, [api, sudoAcccount, activeAccount])

  const oracles = isAcalaStorage(storage) ? ['acalaOracle', 'bandOracle']: ['oracle']

  return (
    <div>
      <div>Sudo Account: {storage.sudo.key?.toString()} {hasSudo ? 'Enabled' : 'Disabled'} </div>
      {
        hasSudo && (
          <div>
            <Collapse>
              <Panel header="Update Currency" key="update-currency">
                <Form onFinish={updateCurrency}>
                  <Item name="address" label="Address" rules={[{ required: true }]}>
                    <Input />
                  </Item>
                  <Item name="currency" label="Currency" rules={[{ required: true }]} initialValue="aUSD">
                    <CurrencySelect />
                  </Item>
                  <Item name="amount" label="Amount" rules={[{ required: true }]}>
                    <InputNumber />
                  </Item>
                  <Item>
                    <Button type="primary" htmlType="submit">Update</Button>
                  </Item>
                </Form>
              </Panel>
            </Collapse>
            <Collapse>
              <Panel header="Feed Oracle" key="feed-oracle">
                <Form onFinish={feedOraclue}>
                  <Item name="oracle" label="Oracle" rules={[{ required: true }]} initialValue={oracles[0]}>
                    <Select>
                      {oracles.map(o => <Option key={o} value={o}>{o}</Option>)}
                    </Select>
                  </Item>
                  <Item name="currency" label="Currency" rules={[{ required: true }]}>
                    <CurrencySelect/>
                  </Item>
                  <Item name="price" label="Price" rules={[{ required: true }]}>
                    <InputNumber />
                  </Item>
                  <Item>
                    <Button type="primary" htmlType="submit">Feed</Button>
                  </Item>
                </Form>
              </Panel>
            </Collapse>
          </div>
        )
      }
    </div>
  )
}

export default observer(Sudo)
