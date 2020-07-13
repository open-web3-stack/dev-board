import 'antd/dist/antd.css'
import './style.scss'

import { Layout, Menu } from 'antd'
import React from 'react'
import ApiProvider from './ApiProvider'
import AccountProvider from './AccountProvider'
import config from './config'
import Overview from './Acala/Overview'

const { Header, Content } = Layout

const App: React.FC = () => (
  <Layout className="app">
    <Header>
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['acala']}>
        <Menu.Item key="acala">Acala</Menu.Item>
      </Menu>
    </Header>
    <Content className="app-content">
      <ApiProvider network='acala' endpoints={config.acala.endpoints}>
        <AccountProvider applicationName="dev-board">
          <Overview />
        </AccountProvider>
      </ApiProvider>
    </Content>
  </Layout>
)

export default App
