import { ApiOutlined, CompassOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Switch, Table } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import React, { useState } from 'react';
import JSONPretty from 'react-json-pretty';

function Analyzer() {

  const payloadTeste = {
    key: 0,
    propertyName: 'nomeColaborador',
    type: 'string',
    description: 'Nome do colaborador',
    fillRule: 'Enviar código de integração do colaborador',
    required: true,
    validated: false
  }

  const [editingRow, setEditingRow] = useState(null);
  const [formPayloadAnalyzed] = Form.useForm();
  const [propList, setPropList] = useState([]);
  const [extraPayloadProps, setExtraPayloadProps] = useState([]);


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
            <Switch style={{ marginTop: '20px' }} defaultChecked onChange={(checked => {
              changeRequiredRow(record.key, checked);
              formPayloadAnalyzed.setFieldValue("required", checked);
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
              formPayloadAnalyzed.setFieldsValue({
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
    } catch (error) {
      feedbackMessage(false, error);
    }
  }

  function feedbackMessage(success, text) {
    success ? message.success(text) : message.error(text)
  }

  function parseInput(payloadInput) {
    try {
      return JSON.parse(payloadInput);
    } catch (error) {
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
      <Form
        name="payloadAnalyzed"
        onFinish={startExamination}
      >
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between', padding: '20px', paddingBottom: '0px' }}>
          <div style={{ width: '45%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px' }}>
              <ApiOutlined style={{ paddingRight: '5px', fontSize: '20px' }} />
              <h1 style={{ paddingTop: '8px', marginBottom: '0px' }}>Payload Cliente</h1>
              <span>Propriedades do payload que será analisado</span>
            </div>
            <Form.Item name="payloadInput">
              <TextArea
                placeholder="Cole um payload de exemplo"
                style={{ maxHeight: '200px', minHeight: '200px', overflowY: "scroll", borderRadius: '5px' }}
              />
            </Form.Item>
          </div>
          <div style={{ width: '45%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px' }}>
              <CompassOutlined style={{ paddingRight: '5px', fontSize: '20px' }} />
              <h1 style={{ paddingTop: '8px', marginBottom: '0px' }}>Payload Base</h1>
              <span>Propriedades do payload que será analisado</span>
            </div>
            <TextArea
              placeholder="Cole um payload de exemplo"
              style={{ maxHeight: '200px', minHeight: '200px', overflowY: "scroll", borderRadius: '5px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between', padding: '20px', paddingTop: '0px' }}>
          <div style={{ width: '45%' }}>
            <Form.Item>
              <Button
                style={{ width: '100%', height: '50px' }}
                type="primary"
                htmlType="submit"
              >
                Examinar Payload
              </Button>
            </Form.Item>
          </div>
          <div style={{ width: '45%' }}>
            <Button
              style={{ width: '100%', height: '50px' }}
              type="primary"
              htmlType="submit"
            >
              Examinar Payload
            </Button>
          </div>
        </div>


      </Form>
      <Form form={formPayloadAnalyzed} onFinish={saveRowChanges}>

        {propList.length ?
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
          : <></>}

      </Form>
      <div style={{ paddingTop: '20px' }}>
        <JSONPretty id="json-pretty" data={propList}></JSONPretty>
        {/* <code>{JSON.stringify(propList)}</code><br /> */}
      </div>
    </>
  )
}

export default Analyzer
