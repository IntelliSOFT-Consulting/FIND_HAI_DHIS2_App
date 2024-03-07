import React, { useState, useEffect } from "react";
import { Table, Card, Modal, Form, Button, Breadcrumb, } from "antd";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import InputItem from "../components/InputItem";
import useProgram from "../hooks/useProgram";
import useEvents from "../hooks/useEvents";
import { format } from "date-fns";

import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  header: {
    borderBottom: "1px solid #f0f0f0",
    color: '#2C6693'
  },
  content: {
    backgroundColor: "#f0f0f0",
    padding: "10px",
    borderRadius: "5px",
  },
});

export default function Feedback() {
  const [formFields, setFormFields] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(null);

  const [form] = Form.useForm();
  const classes = useStyles();

  const { user } = useSelector((state) => state.user);
  const { id: orgUnitId } = useSelector((state) => state.orgUnit);

  const { getFeedback } = useProgram();
  const { getFeedbacks, saveFeedback } = useEvents();

  const saveFeedbacks = async (values) => {

    const payload = {
      orgUnit: orgUnitId,
      program: formFields?.id,
      programStage: formFields?.stage,
      occurredAt: format(new Date(), "yyyy-MM-dd"),
      dataValues: Object.keys(values).map((key) => ({
        dataElement: key,
        value: values[key],
      })),
    };
    await saveFeedback({ events: [payload] });
    form.resetFields();
    setOpen(false);
    const data = await getFeedbacks(formFields?.id, formFields?.stage, user);
    setSubmissions(data);
  };

  useEffect(() => {
    getFeedback().then((data) => {
      setFormFields(data);
      getFeedbacks(data?.id, data?.stage, user).then((submissions) => {
        setSubmissions(submissions);
      });
    });
  }, []);

  const columns = [
    {
      title: "Date Submitted",
      dataIndex: "occurredAt",
      key: "occurredAt",
      render: (text) => format(new Date(text), "dd/MM/yyyy"),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <Button type="link" onClick={() => setOpenView(record)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/">Home</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Feedback</Breadcrumb.Item>
      </Breadcrumb>
      <Card
        title="Feedback"
        extra={
          <Button type="primary" onClick={() => setOpen(true)}>
            Give Feedback
          </Button>
        }
      >
        <Table
          size="small"
          dataSource={submissions}
          columns={columns}
          rowKey={(record) => record.event}
          pagination={submissions?.length > 12 ? { pageSize: 12, showSizeChanger: false } : false}
        />
      </Card>
      <Modal
        title="Feedback"
        open={open}
        okText="Submit"
        onOk={() => {
          form.submit();
        }}
        onCancel={() => setOpen(false)}
      >
        <Form form={form} layout="vertical" onFinish={saveFeedbacks}>
          {formFields?.dataElements?.map((field) => {
            return (
              <Form.Item
                key={field.id}
                label={field.name}
                name={field.id}
                rules={[{ required: field.required, message: `Please enter ${field.name}!` }]}
              >
                <InputItem type={field.valueType} dataElement={field} placeholder={field.name} />
              </Form.Item>
            );
          })}
        </Form>
      </Modal>
      <Modal title="Feedback" open={openView} onCancel={() => setOpenView(null)} footer={null}>
        <div>
          <h3 className={classes.header}>
            Date Submitted: {openView?.occurredAt && format(new Date(openView?.occurredAt), "dd/MM/yyyy")}
          </h3>
          <div className={classes.content}>
          {openView?.dataValues?.map((dataValue) => {
            return (
              <div key={dataValue.dataElement}>
                <h4>{formFields?.dataElements?.find((element) => element.id === dataValue.dataElement)?.name}</h4>
                <p>{dataValue.value}</p>
              </div>
            );
          })}
          </div>
        </div>
      </Modal>
    </div>
  );
}
