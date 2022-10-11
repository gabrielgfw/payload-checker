import { useState } from 'react';
import './App.css';
import { Layout, Input, Menu, Button, Form } from 'antd';

const { Header, Footer, Content } = Layout;
const { TextArea } = Input;

const headerItems = [{
  key: '1',
  label: 'Principal'
}];

function App() {
  const [payloadsExemplo, setPayloadsExemplo] = useState([]);
   
  function handlerAddPayloadExemplo(payload) {
    setPayloadsExemplo([ ...payloadsExemplo, payload ]);
  }

  function onFinish(values) {
    console.log(`# Values:`);
    const { payloadInput } = values;
    const payloadParsed = JSON.parse(payloadInput);
    examineObject(payloadParsed);
    console.log(JSON.parse(payloadInput));

  }

  function examineObject(payloadParsed) {
    for(let prop in payloadParsed) {
      const propType = returnPropertyType(payloadParsed[prop]);
      if(propType == 'object' || propType == 'array') {
        console.log(`# INICIO: ${prop} (${propType})`);
        examineObject(payloadParsed[prop]);
        console.log(`# FIM: ${prop} (${propType})`);
      } else {
        console.log(`# CAMPO: ${prop} (${propType})`);
      }
    }
  }

  function returnPropertyType(prop) {
    if(Array.isArray(prop)) return 'array';
    return typeof(prop);
  }

  return (
    <>
      <Layout style={{ height: '100vh'}}>
        <Header>
          <div className="logo"/>
          <Menu
            theme="dark"
            mode="horizontal"
            items={ headerItems }
          />
        </Header>
        <Content style={{ padding: '50px', height: '100%' }}>
          <div className="site-layout-content">
            <Form
              name="payloadTeste"
              onFinish={onFinish}
            >
              <Form.Item name="payloadInput">
                <TextArea rows={4} placeholder="Cole um payload de exemplo"/>
              </Form.Item>
              
              <Form.Item>
                <Button 
                  style={{ marginTop: '10px'}} 
                  type="primary"
                  htmlType="submit"
                >
                  Adicionar
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Gabriel Felipe Werner - 2022</Footer>
      </Layout>
    </>
  );
}

export default App;
