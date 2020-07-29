import 'antd/dist/antd.css'
import './style.scss'

import React from 'react'
import { Layout, Menu } from 'antd'
import { Link, Switch, Route, Redirect, useLocation } from 'react-router-dom'

import ApiProvider from './ApiProvider'
import AccountProvider from './AccountProvider'
import config from './config'
import Overview from './pages/Overview'

const { Header, Content } = Layout

const App: React.FC = () => {
  const loc = useLocation()
  return (
    <Layout className="app">
      <Header>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={[loc.pathname]}>
          <Menu.Item key="/acala"><Link to="acala">Acala</Link></Menu.Item>
          <Menu.Item key="/laminar"><Link to="laminar">Laminar</Link></Menu.Item>
        </Menu>
      </Header>
      <Content className="app-content">
        <Switch>
          <Route path="/acala">
            <ApiProvider network='acala' endpoints={config.acala.endpoints} key="acala">
              <AccountProvider applicationName="dev-board">
                <Overview />
              </AccountProvider>
            </ApiProvider>
          </Route>
          <Route path="/laminar">
            <ApiProvider network='laminar' endpoints={config.laminar.endpoints} key="lamianr">
              <AccountProvider applicationName="dev-board">
                <Overview />
              </AccountProvider>
            </ApiProvider>
          </Route>
          <Route>
            <Redirect to="/acala" />
          </Route>
        </Switch>
      </Content>
    </Layout>
  )
}

export default App
