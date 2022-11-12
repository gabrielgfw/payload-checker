import React, { useState } from 'react';
import { Layout, Input, Menu, Button, Form, Table, Steps, message, Switch } from 'antd';
import { ProfileOutlined } from '@ant-design/icons';
import './App.css';


const { Header, Footer, Content } = Layout;
const { TextArea } = Input;
const { Step } = Steps;

const headerItems = [{
  key: '1',
  label: 'Principal'
}];

function App() {
  const [propList, setPropList] = useState([{
    key: 0,
    propertyName: 'nomeColaborador',
    type: 'string',
    description: 'Nome do colaborador',
    fillRule: 'Enviar código de integração do colaborador',
    required: true,
    validated: false
  }]);

  const [editingRow, setEditingRow] = useState(null);
  const [form] = Form.useForm();

  const defaultColumns = [
    {
      title: 'Campo',
      dataIndex: 'propertyName',
      key: 'propertyName',
      render: (text, record) => {
        if (editingRow === record.key) {
          return (
            <Form.Item
              name="propertyName"
            >
              <Input className={"editable-cell"} />
            </Form.Item>
          );
        } else {
          return text
        }
      }
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => {
        if (editingRow === record.key) {
          return (
            <Form.Item
              name="type"
            >
              <Input className="editable-cell" />
            </Form.Item>
          );
        } else {
          return text
        }
      }
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => {
        if (editingRow === record.key) {
          return (
            <Form.Item
              name="description"
            >
              <Input className="editable-cell" />
            </Form.Item>
          );
        } else {
          return text
        }
      }
    },
    {
      title: 'Regra de Preenchimento',
      dataIndex: 'fillRule',
      key: 'fillRule',
      render: (text, record) => {
        if (editingRow === record.key) {
          return (
            <Form.Item
              name="fillRule"
            >
              <Input className="editable-cell" />
            </Form.Item>
          );
        } else {
          return text
        }
      }
    },
    {
      title: 'Obrigatório',
      dataIndex: 'required',
      key: 'required',
      render: (_, record) => {
        return (
          <Form.Item
            name="required"
          >
            <Switch style={{marginTop: '20px'}} defaultChecked onChange={(checked => {
              changeRequiredRow(record.key, checked);
              form.setFieldValue("required", checked);
            })} />
          </Form.Item>
        )
      }
    },
    {
      title: 'Ações',
      dataIndex: 'validated',
      key: 'validated',
      render: (_, record) => {
        return (
          <>
            <Button type="link" onClick={() => {
              setEditingRow(record.key);
              form.setFieldsValue({
                propertyName: record.propertyName,
                type: record.type,
                description: record.description,
                fillRule: record.fillRule,
                required: record.required
              })
            }}>Editar</Button>
            <Button type="link" htmlType="submit">Salvar</Button>
          </>
        );
      }
    }
  ];

  function saveRowChanges(values) {
    let selectedRowInformation = propList.find(pos => pos.key === editingRow);
    let collapsedObjects = { ...selectedRowInformation, ...values };
    let indexPosition = propList.findIndex(pos => pos.key === editingRow);
    let allPropList = [...propList];
    allPropList[indexPosition] = collapsedObjects;
    setPropList(allPropList);
    setEditingRow(null);
  }

  function changeRequiredRow(rowKey, boolean) {
    let selectedRowInformation = propList.find(pos => pos.key === rowKey);
    selectedRowInformation.required = boolean;
    let indexPosition = propList.findIndex(pos => pos.key === editingRow);
    let allPropList = [...propList];
    allPropList[indexPosition] = selectedRowInformation;
    setPropList(allPropList);
  }

  function handlerRowBackground(rowProperties) {
    if (rowProperties.required) {
      return ''
    } else {
      return 'not-required-row'
    }
  }

  function startExamination(values) {
    const { payloadInput } = values;
    try {
      const payloadParsed = parseInput(payloadInput);
      reduceArraysForSimplicity(payloadParsed);
      const examined = examinePayload(payloadParsed, []);
      setPropList([...examined]);
      feedbackMessage(true, 'Payload examinado com sucesso');
    } catch(error) {
      feedbackMessage(false, error);
    }
  }

  function feedbackMessage(success, text) {
    success ? message.success(text) : message.error(text)
  }

  function parseInput(payloadInput) {
    try {
      return JSON.parse(payloadInput);
    } catch(error) {
      throw 'Payload informado é inválido';
    }
  }

  function reduceArraysForSimplicity(payloadParsed) {
    for (let prop in payloadParsed) {
      const propType = returnPropertyType(payloadParsed[prop]);
      if (propType === 'array') {
        if (payloadParsed[prop].length > 0) {
          payloadParsed[prop] = payloadParsed[prop].slice(0, 1);
        }
      }
    }
  }

  function examinePayload(payloadParsed, propertiesStack) {
    let properties = propertiesStack;

    for (let prop in payloadParsed) {
      const propType = returnPropertyType(payloadParsed[prop]);
      const propZerada = prop == 0;

      if (propType === 'object' || propType === 'array') {
        properties.push({
          propertyName: propZerada ? '-- início --' : `${prop} (INÍCIO)`,
          type: propType,
          description: '',
          required: true,
          fillRule: '',
          validated: false
        });
        examinePayload(payloadParsed[prop], properties);

        properties.push({
          propertyName: propZerada ? '-- fim --' : `${prop} (FIM)`,
          type: propType,
          description: '',
          required: true,
          fillRule: '',
          validated: false
        });

      } else {
        properties.push({
          propertyName: prop,
          type: propType,
          description: '',
          required: true,
          fillRule: '',
          validated: false
        });
      }
    }

    return applyIndexValue(properties);
  }

  function applyIndexValue(propertiesList) {
    return propertiesList.map((prop, index) => {
      return { key: index + 1, ...prop };
    });
  }

  function returnPropertyType(prop) {
    if (!prop) return 'null';
    if (Array.isArray(prop)) return 'array';
    return typeof (prop);
  }


  return (
    <>
      <Layout style={{ height: '100vh' }}>
        <Header>
          <div className="logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            items={headerItems}
          />
        </Header>
        <Content style={{ padding: '30px', height: '100%' }}>
          <div style={{ height: '100%' }}>

            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '10px' }}>
              <ProfileOutlined style={{ padding: '5px', fontSize: '24px' }}/>
              <h1 style={{ paddingTop: '8px'}}>Payload para examinar</h1>
            </div>

            <Form
              name="payloadTeste"
              onFinish={startExamination}
            >
              <Form.Item name="payloadInput">
                <TextArea rows={4} placeholder="Cole um payload de exemplo" />
              </Form.Item>

              <Form.Item>
                <Button
                  style={{ marginTop: '10px' }}
                  type="primary"
                  htmlType="submit"
                >
                  Examinar Payload
                </Button>
              </Form.Item>
            </Form>
            <Form form={form} onFinish={saveRowChanges}>
              <Table
                rowClassName={(record, index) => {
                  console.log(record);
                  return handlerRowBackground(record)
                }}
                dataSource={propList}
                columns={defaultColumns}
                sticky={true}
                pagination={false}
                scroll={{ y: '50vh' }}
                bordered={false}
                size={'small'}
              />
            </Form>
            <code style={{ marginTop: '40px' }}>{JSON.stringify(propList)}</code><br />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Gabriel Felipe Werner - 2022</Footer>
      </Layout>
    </>
  );
}

export default App;
