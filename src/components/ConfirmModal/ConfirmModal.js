import React, { useState } from 'react';
import { Button, Modal } from 'antd';

const ConfirmModal = ({ buttonText, buttonType, buttonDanger, modalTitle, modalText, confirmAction }) => {
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
      <Button type={buttonType} danger={buttonDanger} onClick={showModal}>
        {buttonText}
      </Button>
      <Modal title={modalTitle} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <p>{modalText}</p>
      </Modal>
    </>
  );
};
export default ConfirmModal;