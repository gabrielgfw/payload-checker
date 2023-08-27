import { Button, Collapse, Form, Input, message, Switch, Table } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import 'animate.css';
import './Analyzer.css';
import { DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import * as ProjectSession from '../../services/ProjectSession';
import { v4 as uuidv4 } from 'uuid';
import ConfirmModal from '../ConfirmModal/ConfirmModal';

const { Panel } = Collapse;

function Analyzer() {
  const [editingRow, setEditingRow] = useState();
  const [formPayloadAnalyzed] = Form.useForm();
  const [projectId, setProjectId] = useState('');
  const [payloadChecked, setPayloadChecked] = useState({});
  const [propList, setPropList] = useState([]);

  // Save on changes:
  useEffect(() => {
    if (propList.length && payloadChecked) {
      saveCurrentChanges();
    }
  }, [propList, payloadChecked]);


  // Load once:
  useEffect(() => {
    const storagedProject = JSON.parse(ProjectSession.loadProjects());
    if (storagedProject) {
      console.log(`# Loaded Project found!!`);
      console.log(storagedProject);
      setPayloadChecked(storagedProject.projects[0].payload_checkd);
      setPropList(storagedProject.projects[0].prop_list);
    }
  }, []);

  const defaultColumns = [
    {
      title: 'Name',
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
      title: 'Type',
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
      title: 'Description',
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
      title: 'Fill rule',
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
      title: 'Required',
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
      title: 'Actions',
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
            }}>Edit</Button>
            <Button type="link" htmlType="submit">Save</Button>
          </>
        );
      }
    }
  ];

  function startExamination(values) {
    const { payloadInput } = values;
    try {
      const payloadParsed = parseInput(payloadInput);
      const payloadSimplified = reduceArraysForSimplicity(payloadParsed);
      const examined = examinePayload(payloadSimplified, []);
      setPayloadChecked(payloadSimplified);
      setPropList([...examined]);
      feedbackMessage(true, 'Payload checked');
    } catch (error) {
      feedbackMessage(false, error);
    }
  }


  function handleDeleteProject() {
    ProjectSession.deleteProject();
    setProjectId('');
    setPayloadChecked({});
    setPropList([]);
    feedbackMessage(true, 'Project deleted');
  }


  function saveCurrentChanges() {
    const newUuid = uuidv4();
    if (!projectId) setProjectId(newUuid);
    ProjectSession.saveProject({
      uuid: projectId ? projectId : newUuid,
      payload_checked: payloadChecked,
      prop_list: propList
    });
  }


  function feedbackMessage(success, text) {
    success ? message.success(text) : message.error(text)
  }

  function parseInput(payloadInput) {
    try {
      return JSON.parse(payloadInput);
    } catch (error) {
      throw 'Not a valid payload';
    }
  }

  function reduceArraysForSimplicity(payloadParsed) {
    let overallArrayClean = Array.isArray(payloadParsed) ? payloadParsed.slice(0, 1) : payloadParsed;

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
          propertyName: propZerada ? '-- start --' : `${prop} (START)`,
          type: propType,
          description: '',
          required: true,
          fillRule: '',
          validated: false
        });
        examinePayload(payloadParsed[prop], properties);

        properties.push({
          propertyName: propZerada ? '-- end --' : `${prop} (END)`,
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
    if (Array.isArray(prop)) return 'array';
    if (prop === "") return 'string'
    if (prop === 0) return 'number'
    if (!prop) return 'null';
    return typeof (prop);
  }

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

  function exportToCSV() {
    let text = `Name;Type;Description;Fill rule;Required\n`;
    propList.forEach(line => {
      text += `${line.propertyName};${line.type};${line.description};${line.fillRule};${line.required}\n`
    });
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'payload-checker.csv');
    link.click();
  }

  function exportToXLSX() {
    const propFiltered = propList.map(p => {
      return {
        'Name': p.propertyName,
        'Type': p.type,
        'Description': p.description,
        'Fill rule': p.fillRule,
        'Required': p.required
      }
    });
    const sheet = XLSX.utils.json_to_sheet(propFiltered);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Sheet1');
    const xlsDocument = XLSX.write(book, { type: 'buffer', bookType: 'xlsx' });
    const blob = new Blob([xlsDocument], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'payload-checker.xlsx');
    link.click();
  }

  function exportToTXT() {
    let text = `Name\tType\tDescription\tFill rule\tRequired\n`;
    propList.forEach(line => {
      text += `${line.propertyName}\t${line.type}\t${line.description}\t${line.fillRule}\t${line.required}\n`
    });
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'payload-checker.txt');
    link.click();
  }


  return (
    <>
      {propList.length ?
        <div
          className="animate__animated animate__fadeInLeft"
          style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'end', paddingRight: '20px' }}
        >
          <div>
            <Button
              style={{ margin: '10px' }}
              type="primary"
              onClick={exportToCSV}
            >
              <DownloadOutlined />
              Export to CSV
            </Button>
            <Button
              style={{ margin: '10px' }}
              type="primary"
              onClick={exportToXLSX}
            >
              <DownloadOutlined />
              Export to XLSX
            </Button>
            <Button
              style={{ margin: '10px' }}
              type="primary"
              onClick={exportToTXT}
            >
              <DownloadOutlined />
              Export to TXT
            </Button>

            <ConfirmModal
              buttonText="Delete Project"
              modalTitle="Delete current project"
              modalText="Confirm to delete current project"
              confirmAction={handleDeleteProject}
            />
          </div>
        </div>
        : <></>}

      <Form form={formPayloadAnalyzed} onFinish={saveRowChanges}>
        {propList.length ?
          <div
            className="animate__animated animate__fadeInLeft"
            style={{ margin: '10px 20px 20px 20px' }}>
            <Table
              rowClassName={(record, index) => handlerRowBackground(record)}
              dataSource={propList}
              columns={defaultColumns}
              sticky={true}
              pagination={false}
              scroll={{ y: '50vh' }}
              bordered={false}
              size={'small'}
              style={{ boxShadow: '0px 0px 10px 0px rgb(34 34 34 / 15%)', fontSize: "5px" }}
            />
          </div>
          : <></>}
      </Form>

      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between', padding: '20px', paddingBottom: '0px' }}>
        <Form name="payloadAnalyzed" onFinish={startExamination} style={{ width: '80%' }}>
          <div style={{ width: '100%' }}>
            <Collapse
              className="collapse-wrapper"
              defaultActiveKey={['1']}
              style={{ backgroundColor: 'rgb(16,16,16,0.85)', border: 'none', borderBottom: '20px', borderRadius: '10px', boxShadow: '0px 0px 10px 0px rgb(34 34 34 / 15%)' }}
            >
              <Panel
                header="Payload to be checked"
                key="1"
                style={{ border: 'none' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'left', padding: '15px', paddingTop: '0' }}>
                  <span>
                    Enter the payload to be checked below, all payload fields will be detailed.
                  </span>
                </div>
                <Form.Item name="payloadInput">
                  <TextArea
                    placeholder="Paste a valid payload to be checked."
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
                <Form.Item style={{ marginBottom: '5px' }}>
                  <Button
                    style={{ width: '100%', height: '50px', boxShadow: '0px 0px 10px 0px rgb(34 34 34 / 20%)' }}
                    type="primary"
                    htmlType="submit"
                  >
                    <strong>Check Payload</strong>
                  </Button>
                </Form.Item>
              </Panel>
            </Collapse>

          </div>
        </Form>
        <div style={{ width: '100%' }}>
        </div>
      </div>
    </>
  )
}

export default Analyzer
