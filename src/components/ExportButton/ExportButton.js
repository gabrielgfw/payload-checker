import React, { useContext } from 'react';
import { SessionContext } from '../Analyzer/Analyzer';
import * as ExtensionConversor from '../../services/ExtensionConversor';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';


function ExportButton() {
  const { projectId, propList, payloadChecked } = useContext(SessionContext);

  function handleExportToCSV() {
    ExtensionConversor.exportToCSV(propList);
  }

  function handleExportToXLSX() {
    ExtensionConversor.exportToXLSX(propList);
  }

  function handleExportToTXT() {
    ExtensionConversor.exportToTXT(propList);
  }


  return (
    <>
      <Button
        style={{ margin: '10px' }}
        type="primary"
        onClick={handleExportToCSV}
      >
        <DownloadOutlined />
        Export to CSV
      </Button>
      <Button
        style={{ margin: '10px' }}
        type="primary"
        onClick={handleExportToXLSX}
      >
        <DownloadOutlined />
        Export to XLSX
      </Button>
      <Button
        style={{ margin: '10px' }}
        type="primary"
        onClick={handleExportToTXT}
      >
        <DownloadOutlined />
        Export to TXT
      </Button>
    </>
  )
}

export default ExportButton;