import React from "react";
import { Modal } from "antd";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  // change the background and text color of the modal header
  "@global": {
    "ant-modal-content": {
      padding: "0px !important",
    },
    ".ant-modal-header": {
      backgroundColor: "#012F6C",
      color: "#fff",
      padding: "10px 1rem !important",
    },
    ".ant-modal-title": {
      color: "#fff",
    },
    ".ant-modal-body, .ant-modal-footer": {
      padding: "1rem !important",
    },
  },
});

export default function ModalItem({ children, ...props }) {
  const classes = useStyles();
  return (
    <Modal {...props} className={classes.root}>
      {children}
    </Modal>
  );
}
