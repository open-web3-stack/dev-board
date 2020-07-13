import React, { ReactNode, FC, useState, useEffect, createContext } from 'react'
import { Spin } from 'antd'
import { ApiRx, WsProvider, ApiPromise } from '@polkadot/api'
import { createStorage } from '@open-web3/api-mobx'

import { options } from '@acala-network/api'

export interface ApiContextData {
  api: ApiRx;
  storage: any;
}

export const ApiContext = createContext<ApiContextData>({} as ApiContextData)

interface Props {
  network: 'acala' | 'laminar';
  endpoints: string[],
  children: ReactNode;
}

const ApiProvider: FC<Props> = ({
  network,
  endpoints,
  children,
}) => {
  const [api, setApi] = useState<ApiRx>()
  const [storage, setStorage] = useState<any>()

  const renderContent = (): ReactNode => {
    if (api === undefined || storage === undefined) {
      return (
        <div className="loading">
          <Spin size="large"/>
          <div>Loading...</div>
        </div>
      )
    }

    return children
  }

  useEffect(() => {
    if (api === undefined) {
      if (network !== 'acala') {
        throw new Error('Network not supported yet')
      }

      const ws = new WsProvider(endpoints)

      const opt = options({ provider: ws })

      ApiRx.create(opt).toPromise().then(api => setApi(api))

      ApiPromise.create(opt).then(api => {
        const stroage = createStorage(api, ws)
        setStorage(stroage)
      })

      return
    }

    return (): void => Reflect.has(api, 'disconnect') ? api.disconnect() : undefined
  }, [api, network, endpoints])

  return (
    <ApiContext.Provider
      value={{ api: api!, storage }}
    >
      {renderContent()}
    </ApiContext.Provider>
  )
}

export default ApiProvider
