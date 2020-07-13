import { useContext } from 'react'

import { ApiContext } from './ApiProvider'
import { AccountContext } from './AccountProvider'

export const useApi = () => useContext(ApiContext)
export const useAccounts = () => useContext(AccountContext)
