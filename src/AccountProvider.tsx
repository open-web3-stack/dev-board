import React, { useState, useEffect, createContext, FC, useCallback } from 'react'

import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'

import { useApi } from './hooks'

export interface AccountData {
  accounts: InjectedAccountWithMeta[];
  activeAccount: (address: string) => Promise<void>;
}

export const AccountContext = createContext<AccountData>({} as AccountData)

interface Props {
  applicationName: string;
}

const AccountProvider: FC<Props> = ({
  applicationName,
  children
}) => {
  const { api } = useApi()
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([])

  const activeAccount = useCallback(async (address: string): Promise<void> => {
    const injector = await web3FromAddress(address)

    api.setSigner(injector.signer)
  }, [api])


  useEffect(() => {
    web3Enable(applicationName).then(async () => {
      const accounts = await web3Accounts()

      setAccounts(accounts)
    })
  }, [applicationName])


  return (
    <AccountContext.Provider
      value={{
        accounts,
        activeAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export default AccountProvider
