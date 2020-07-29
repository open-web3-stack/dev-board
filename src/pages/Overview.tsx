import React, { useMemo } from 'react'
import { combineLatest } from 'rxjs'
import { Observer } from 'mobx-react'
import { PageHeader, Descriptions, Collapse } from 'antd'

import { useApi } from '../hooks'
import SubscribeObservable from '../components/SubscribeObservable'

import Sudo from './Sudo'
import Prices from './Prices'
import Loans from './acala/Loans'

const { Panel } = Collapse

type HeaderProps = {
  chain?: string;
  blockNumber?: number;
  blockHash?: string;
  finalizedNumber?: number;
  finalizedHash?: string;
  now?: number;
}

const Header: React.FC<HeaderProps> = ({
  chain, blockNumber, blockHash, finalizedNumber, finalizedHash, now
}) => (
  <PageHeader
    ghost={false}
    title={chain}
  >
    <Descriptions size="small" column={3}>
      <Descriptions.Item label="Latest Block">
        {blockNumber} &nbsp;<span className="hash-hex">{blockHash}</span>
      </Descriptions.Item>
      <Descriptions.Item label="Finalized Block">
        {finalizedNumber} &nbsp;<span className="hash-hex">{finalizedHash}</span>
      </Descriptions.Item>
      <Descriptions.Item label="Block Time">{now && new Date(now).toLocaleString()}</Descriptions.Item>
    </Descriptions>
  </PageHeader>
)

const Content: React.FC<{ network: string }> = ({ network }) => (
  <>
    <Collapse defaultActiveKey={['prices', 'loans']}>
      <Panel header="Sudo" key="sudo">
        <Sudo />
      </Panel>
      <Panel header="Prices" key="prices">
        <Prices />
      </Panel>
      {
        network === 'acala' &&
        <Panel header="Loans" key="loans">
          <Loans />
        </Panel>
      }
    </Collapse>
  </>
)

const Overview = () => {
  const { api, storage, network } = useApi()

  const data = useMemo(
    () => combineLatest(
      api.rpc.system.chain(),
      api.rpc.chain.subscribeNewHeads(),
      api.rpc.chain.subscribeFinalizedHeads()
    ),
    [api]
  )

  return (
    <div className="page-overview">
      <SubscribeObservable value={data}>
        {(data) => {
          const [chain, header, finalizedHeader] = data || []
          return (
            <Observer>
              {() => {
                const now = storage.timestamp.now?.toNumber()
                return (
                  <>
                    <Header {...{
                      chain: chain?.toString(),
                      blockNumber: header?.number.toNumber(),
                      blockHash: header?.hash.toHex(),
                      finalizedNumber: finalizedHeader?.number.toNumber(),
                      finalizedHash: finalizedHeader?.hash.toHex(),
                      now
                    }} />
                    <Content network={network} />
                  </>
                )
              }}
            </Observer>
          )
        }}
      </SubscribeObservable>
    </div>
  )
}

export default Overview
