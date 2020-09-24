import React, { ReactNode, FC, useState, useEffect, createContext } from 'react'
import { Spin } from 'antd'
import { ApiRx, WsProvider, ApiPromise } from '@polkadot/api'
import { createStorage } from '@open-web3/api-mobx'

import { options as acalaOptions } from '@acala-network/api'
import { options as laminarOptions } from '@laminar/api'

import { StorageType as AcalaStorageType } from '@acala-network/types'
import { StorageType as LaminarStorageType } from '@laminar/types'


export interface ApiContextData {
  api: ApiRx;
  storage: AcalaStorageType | LaminarStorageType;
  network: 'acala' | 'laminar';
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
  const [storage, setStorage] = useState<ApiContextData['storage']>()
  const [lastNetwork, setLastNetwork] = useState<string>(network)

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
    if (api === undefined || network !== lastNetwork) {
      setLastNetwork(network)
      setApi(undefined)
      setStorage(undefined)

      const ws = new WsProvider(endpoints)

      const optFn = network === 'acala' ? acalaOptions : laminarOptions

      const opt = optFn({ provider: ws })

      ApiRx.create(opt as any).toPromise().then(api => setApi(api))

      ApiPromise.create(opt as any).then(api => {
          setStorage(createStorage(api as any, ws as any))
      })

      return
    }

    return () => {
      Reflect.has(api, 'disconnect') && api.disconnect()
    }
  }, [api, network, endpoints, lastNetwork])

  return (
    <ApiContext.Provider
      value={{ api: api!, storage: storage!, network }}
    >
      {renderContent()}
    </ApiContext.Provider>
  )
}

export default ApiProvider
