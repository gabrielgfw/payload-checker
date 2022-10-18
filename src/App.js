import { useState } from 'react';
import './App.css';
import { Layout, Input, Menu, Button, Form, Table } from 'antd';
import reportWebVitals from './reportWebVitals';

const { Header, Footer, Content } = Layout;
const { TextArea } = Input;

const headerItems = [{
  key: '1',
  label: 'Principal'
}];




function App() {
  const [propList, setPropList] = useState([{
    propertyName: 'rateios',
    type: 'array',
    description: '',
    required: false
  }]);

  const columns = [
    {
      title: 'Campo',
      dataIndex: 'propertyName',
      key: 'propertyName',
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Obrigatório',
      dataIndex: 'required',
      key: 'required',
    }
  ];

  function onFinish(values) {
    const { payloadInput } = values;
    const payloadParsed = JSON.parse(payloadInput);
    reduceArraysForSimplicity(payloadParsed);
    const examined = examinePayload(payloadParsed, []);
    setPropList([ ...examined ]);
  }


  function reduceArraysForSimplicity(payloadParsed) {
    for(let prop in payloadParsed) {
      const propType = returnPropertyType(payloadParsed[prop]);
      if(propType === 'array') {
        if(payloadParsed[prop].length > 0) {
          payloadParsed[prop] = payloadParsed[prop].slice(0, 1);
        }
      }
    }
  }

  function examinePayload(payloadParsed, propertiesStack) {
    let properties = propertiesStack;

    for(let prop in payloadParsed) {
      const propType = returnPropertyType(payloadParsed[prop]);
      const propZerada = prop == 0;

      if(propType === 'object' || propType === 'array') {
        properties.push({
          propertyName: propZerada ? '-- início --' : `${prop} (INÍCIO)`,
          type: propType,
          description: ''
        });
        examinePayload(payloadParsed[prop], properties);

        properties.push({
          propertyName: propZerada ? '-- fim --' : `${prop} (FIM)`,
          type: propType,
          description: ''
        });

      } else {
        properties.push({
          propertyName: prop,
          type: propType,
          description: ''
        });
      }
    }

    return applyIndexValue(properties);
  }

  function applyIndexValue(propertiesList) {
    return propertiesList.map((prop, index) => {
      return { key: index+1, ...prop };
    });
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
                  Examinar Payload
                </Button>
              </Form.Item>
            </Form>
            <Table 
              dataSource={propList} 
              columns={columns} 
              sticky={true} 
              pagination={false} 
              scroll={{ y: '50vh'}} 
              bordered={true}
              size={'small'}
            />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Gabriel Felipe Werner - 2022</Footer>
      </Layout>
    </>
  );
}

export default App;
