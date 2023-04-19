import React, { lazy, Suspense } from 'react';
import { Layout, Menu, Skeleton } from 'antd';
import './App.css';
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";


const Info = lazy(() => import('./pages/Info'));
const Checker = lazy(() => import('./pages/Checker'));

const { Header, Footer, Content } = Layout;
const headerItems = [{
  key: '/payload-checker/info',
  label: 'Info'
},
{
  key: '/payload-checker/checker',
  label: 'Checker'
}];


// [BG] Cinza claro: backgroundColor: 'rgb(230,230,230)'
// [BG] Cinza médio: backgroundColor: 'rgb(170,165,150)'
// [BG] Azul: backgroundColor: 'rgb(130,190,255)'

function App() {
  const navigate = useNavigate();
  return (
    <>
      <Layout style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'rgb(130,190,255)' }}>
        <Header theme="light">
          <div className="logo" />
          <Menu
            onClick={({ key }) => { navigate(key) }}
            theme="dark"
            mode="horizontal"
            items={headerItems}
          />
        </Header>
        <Content style={{ padding: '40px', paddingTop: '15px', height: '100%' }}>
          <div style={{ height: '100%' }}>
            <Suspense fallback={<Skeleton active />}>
              <Routes>
                <Route path="/payload-checker/" element={<Navigate to="/payload-checker/info" />} />
                <Route path="/payload-checker/info" element={<Info />} />
                <Route path="/payload-checker/checker" element={<Checker />} />
              </Routes>
            </Suspense>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center', marginTop: 'auto', backgroundColor: 'rgb(12,12,12)', height: '60px', color: '#858585', fontSize: '0.8rem' }}>
          <span style={{ marginBottom: '5px' }}>
            Gabriel Werner - 2023 - <a href="https://github.com/gabrielgfw/payload-checker">Github</a>
          </span>
        </Footer>
      </Layout>
    </>
  );
}

export default App;
