import React from "react";
import { Modal } from "antd";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  "@global": {
    ".ant-modal-content": {
      padding: "0px !important",
    },
    ".ant-modal-header": {
      background: "#012F6C !important",
      color: "#fff !important",
      padding: "10px 1rem !important",
    },
    ".ant-modal-title, .ant-modal-close": {
      color: "#fff !important",
    },
    ".ant-modal-body, .ant-modal-footer": {
      padding: "10px 1rem !important",
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
