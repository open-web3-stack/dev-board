import React, { ReactNode, FC, useState, useEffect, createContext } from 'react'
import { Spin } from 'antd'
import { ApiRx, WsProvider, ApiPromise } from '@polkadot/api'
import { createStorage, BaseStorageType } from '@open-web3/api-mobx'

import { options as acalaOptions } from '@acala-network/api'
import { options as laminarOptions } from '@laminar/api'

// TODO: update after `augment-api-mobx` is available on index
import { StorageType as AcalaStorageType } from '@acala-network/types/interfaces/augment-api-mobx'
import { StorageType as LaminarStorageType } from '@laminar/types'

export type Storage = BaseStorageType & (AcalaStorageType | LaminarStorageType);

export interface ApiContextData {
  api: ApiRx;
  storage: Storage;
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
  const [storage, setStorage] = useState<Storage>()
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

      ApiRx.create(opt).toPromise().then(api => setApi(api))

      ApiPromise.create(opt).then(api => {
        if (network === 'acala') {
          const stroage = createStorage<AcalaStorageType>(api, ws)
          setStorage(stroage)
        } else if (network === 'laminar') {
          const stroage = createStorage<LaminarStorageType>(api, ws)
          setStorage(stroage)
        }
      })

      return
    }

    return (): void => Reflect.has(api, 'disconnect') ? api.disconnect() : undefined
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
