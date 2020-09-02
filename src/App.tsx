import 'antd/dist/antd.css'
import './style.scss'

import React, { useState } from 'react'
import { Layout, Menu, Button } from 'antd'
import { Link, Switch, Route, Redirect, useLocation } from 'react-router-dom'

import ApiProvider from './ApiProvider'
import AccountProvider from './AccountProvider'
import { config } from './config'
import Overview from './pages/Overview'
import EndpointSetting from './EndpointSetting'
import Modal from 'antd/lib/modal/Modal'


const { Header, Content } = Layout

const App: React.FC = () => {
  const [settingVisible, setSettingVisible] = useState(false)
  const loc = useLocation()
  const pathname = loc.pathname.replace('/', '')
  const network = ['acala','laminar'].includes(pathname) ? pathname : 'acala'

  return (
    <Layout className="app">
      <Header>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={[loc.pathname]}>
          <Menu.Item key="/acala"><Link to="acala">Acala</Link></Menu.Item>
          <Menu.Item key="/laminar"><Link to="laminar">Laminar</Link></Menu.Item>
          <Button style={{ position:'absolute', right: '20px', top: '15px' }} onClick={() => setSettingVisible(true)}>Settings</Button>
        </Menu>
        <Modal width={800} title="Configure endpoints" visible={settingVisible} onCancel={() => setSettingVisible(false)} destroyOnClose onOk={() => window.location.reload()}>
          <EndpointSetting network={network as any} />
        </Modal>
      </Header>
      <Content className="app-content">
        <Switch>
          <Route path="/acala">
            <ApiProvider network='acala' endpoints={config.getEndpints('acala')} key="acala">
              <AccountProvider applicationName="dev-board">
                <Overview />
              </AccountProvider>
            </ApiProvider>
          </Route>
          <Route path="/laminar">
            <ApiProvider network='laminar' endpoints={config.getEndpints('laminar')} key="lamianr">
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
