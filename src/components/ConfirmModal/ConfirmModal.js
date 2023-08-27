import React, { useState } from 'react';
import { Button, Modal } from 'antd';

const ConfirmModal = ({ buttonText, modalTitle, modalText, confirmAction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    confirmAction();
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <Button type="primary" danger onClick={showModal}>
        {buttonText}
      </Button>
      <Modal title={modalTitle} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <p>{modalText}</p>
      </Modal>
    </>
  );
};
export default ConfirmModal;