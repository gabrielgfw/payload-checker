import React, { useContext, useEffect, useRef, useState } from 'react';
import { Layout, Input, Menu, Button, Form, Table, Steps, Checkbox, Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import './App.css';


const { Header, Footer, Content } = Layout;
const { TextArea } = Input;
const { Step } = Steps;

const headerItems = [{
  key: '1',
  label: 'Principal'
}];


const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};



function App() {
  const [propList, setPropList] = useState([{
    key: 0,
    propertyName: 'rateios',
    type: 'array',
    description: '',
    required: false,
    validated: false
  }]);

  const defaultColumns = [
    {
      title: 'Campo',
      dataIndex: 'propertyName',
      key: 'propertyName',
      editable: true
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      editable: true
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      editable: true
    },
    {
      title: 'Obrigatório',
      dataIndex: 'required',
      key: 'required',
      editable: true
    },
    {
      title: 'Regra de Preenchimento',
      dataIndex: 'fillRule',
      key: 'fillRule',
      editable: true
    },
    {
      title: 'Validado',
      dataIndex: 'validated',
      key: 'validated',
      switchable: true,
      render: (value) => <Switch onChange={console.log(value)}></Switch>
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
          description: '',
          required: false,
          fillRule: '',
          validated: false
        });
        examinePayload(payloadParsed[prop], properties);

        properties.push({
          propertyName: propZerada ? '-- fim --' : `${prop} (FIM)`,
          type: propType,
          description: '',
          required: false,
          fillRule: '',
          validated: false
        });

      } else {
        properties.push({
          propertyName: prop,
          type: propType,
          description: '',
          required: false,
          fillRule: '',
          validated: false
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

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if(col.editable) {
      return {
        ...col,
        onCell: (record) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave,
        }),
      }

    } else if(col.switchable) {
      return {
        ...col,
        onCell: (record, rowIndex) => ({
          record,
          switchable: col.switchable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave,
        }),
      }
    } else {
      return col;
    }
  });

  const handleSave = (row) => {
    const newData = [...propList];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setPropList(newData);
  };

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
              components={components}
              dataSource={propList} 
              columns={columns} 
              sticky={true} 
              pagination={false} 
              scroll={{ y: '50vh'}} 
              bordered={true}
              size={'small'}
              rowClassName={() => 'editable-row'}
              onChange={console.log(propList)}
            />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Gabriel Felipe Werner - 2022</Footer>
      </Layout>
    </>
  );
}

export default App;
