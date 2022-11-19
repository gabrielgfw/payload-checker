import { ApiOutlined, CompassOutlined, NodeExpandOutlined } from '@ant-design/icons';
import { Button, Collapse, Form, Input, message, Switch, Table } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import React, { useState } from 'react';
import JSONPretty from 'react-json-pretty';
import 'animate.css';
import './Analyzer.css';

const { Panel } = Collapse;

function Analyzer() {
  const [editingRow, setEditingRow] = useState(null);
  const [formPayloadAnalyzed] = Form.useForm();
  const [propList, setPropList] = useState([]);

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
    return rowProperties.required ? '' : 'not-required-row';
  }

  function startExamination(values) {
    const { payloadInput } = values;
    try {
      const payloadParsed = parseInput(payloadInput);
      const payloadSimplified = reduceArraysForSimplicity(payloadParsed);
      const examined = examinePayload(payloadSimplified, []);
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
    let overallArrayClean = Array.isArray(payloadParsed) ? payloadParsed.slice(0, 1) : payloadParsed;

    console.log(`# Raw payload values:`);
    console.log(payloadParsed);

    console.log(`# Overall:`);
    console.log(overallArrayClean);

    for (let prop in overallArrayClean) {
      const propType = returnPropertyType(overallArrayClean[prop]);
      if (propType === 'array') {
        if (overallArrayClean[prop].length > 0) {
          overallArrayClean[prop] = overallArrayClean[prop].slice(0, 1);
        }
      }
    }

    return overallArrayClean;
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

  // backgroundColor: 'rgb(0,21,41,0.9)'

  return (
    <>
      <Form
        name="payloadAnalyzed"
        onFinish={startExamination}
      >
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between', padding: '20px', paddingBottom: '0px' }}>
          <div style={{ width: '45%' }}>

            <Collapse
              className="collapse-wrapper"
              defaultActiveKey={['1']}
              style={{ backgroundColor: 'rgb(16,16,16,0.85)', border: 'none', borderBottom: '20px', borderRadius: '10px', boxShadow: '0px 0px 10px 0px rgb(34 34 34 / 15%)' }}
            >
              <Panel
                header="Payload a ser analisádo (resultado final desejado)"
                key="1"
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'left', padding: '15px', paddingTop: '0' }}>
                  <h1 style={{ paddingTop: '2px', marginBottom: '0px' }}><strong>Payload Cliente</strong></h1>
                  <span>Propriedades do payload que será analisado</span>
                </div>
                <Form.Item name="payloadInput">
                  <TextArea
                    placeholder="Cole um payload de exemplo"
                    style={{
                      resize: 'none',
                      border: 'none',
                      maxHeight: '200px',
                      minHeight: '200px',
                      overflowY: "scroll",
                      borderRadius: '5px',
                      boxShadow: '0px 0px 10px 0px rgb(34 34 34 / 5%)'
                    }}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    style={{ width: '100%', height: '50px', boxShadow: '0px 0px 10px 0px rgb(34 34 34 / 20%)' }}
                    type="primary"
                    htmlType="submit"
                  >
                    <strong>Examinar Payload</strong>
                  </Button>
                </Form.Item>
              </Panel>
            </Collapse>


          </div>
          <div style={{ width: '45%' }}>
            {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px' }}>
              <CompassOutlined style={{ paddingRight: '5px', fontSize: '20px' }} />
              <h1 style={{ paddingTop: '8px', marginBottom: '0px' }}>Payload Base</h1>
              <span>Propriedades do payload que será analisado</span>
            </div>
            <TextArea
              placeholder="Cole um payload de exemplo"
              style={{ resize: 'none', border: 'none', maxHeight: '200px', minHeight: '200px', overflowY: "scroll", borderRadius: '5px' }}
            /> */}
          </div>
        </div>

      </Form>
      <Form form={formPayloadAnalyzed} onFinish={saveRowChanges}>

        {propList.length ?
          <div
            className="animate__animated animate__bounceIn"
            style={{ margin: '40px 20px 20px 20px' }}>
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
              style={{ boxShadow: '0px 0px 10px 0px rgb(34 34 34 / 15%)' }}
            />
          </div>

          : <></>}

      </Form>
      <div style={{ margin: '40px 20px 20px 20px', width: '40%' }}>
        <Collapse
          className="collapse-wrapper"
          style={{ backgroundColor: 'rgb(95 108 108 / 85%)', border: 'none', borderBottom: '20px', borderRadius: '10px', boxShadow: '0px 0px 10px 0px rgb(34 34 34 / 15%)' }}
        >
          <Panel
            header="Dados para uso externo (form dos dados da tabela)"
            key="1"
          >
            <JSONPretty
              id="json-pretty"
              data={propList}
              style={{ maxHeight: '200px', minHeight: '200px', overflowY: "scroll" }}
            />
          </Panel>
        </Collapse>
      </div>
    </>
  )
}

export default Analyzer
