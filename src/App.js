import React from 'react';
import { Layout, Menu, message } from 'antd';
import { ProfileOutlined } from '@ant-design/icons';
import './App.css';
import Analyzer from './components/Analyzer';

const { Header, Footer, Content } = Layout;

const headerItems = [{
  key: '1',
  label: 'Principal'
}];

function App() {

  function feedbackMessage(success, text) {
    success ? message.success(text) : message.error(text)
  }

  //height: '100vh'
  return (
    <>
      <Layout style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header>
          <div className="logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            items={headerItems}
          />
        </Header>
        <Content style={{ padding: '40px', paddingTop: '15px', height: '100%' }}>
          <div style={{ height: '100%' }}>
            <Analyzer />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center', marginTop: 'auto' }}>Gabriel Felipe Werner - 2022</Footer>
      </Layout>
    </>
  );
}

export default App;
