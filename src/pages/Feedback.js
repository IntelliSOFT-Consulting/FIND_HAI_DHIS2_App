import React, { useState, useEffect } from "react";
import { Table, Card, Modal, Form, Button, Breadcrumb, Alert } from "antd";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import InputItem from "../components/InputItem";
import useProgram from "../hooks/useProgram";
import useEvents from "../hooks/useEvents";
import useUpload from "../hooks/useUpload";
import { format } from "date-fns";

import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  header: {
    borderBottom: "1px solid #f0f0f0",
    color: "#2C6693",
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
  const [fileResourceId, setFileResourceId] = useState({});

  const [form] = Form.useForm();
  const classes = useStyles();

  const { user } = useSelector((state) => state.user);
  const { id: orgUnitId } = useSelector((state) => state.orgUnit);

  const { getFeedback } = useProgram();
  const { getFeedbacks, saveFeedback } = useEvents();
  const { upload } = useUpload();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const name = e.target?.name;
    const fileId = await upload(file);
    console.log(name);
    setFileResourceId({ [name]: fileId });
  };

  const saveFeedbacks = async (values) => {
    values = { ...values, ...fileResourceId };
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
        <Alert
          type="info"
          message="We value your input! Use this form to let us know if something isn't working well or if you have ideas for improvements"
          showIcon
          style={{ marginBottom: "1rem" }}
        />
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
          {formFields?.sections?.map((section) => {
            return (
              <div key={section.id}>
                <h3 className={classes.header}>{section.name}</h3>
                {section.dataElements.map((field) => {
                  return (
                    <Form.Item
                      key={field.id}
                      label={field.name}
                      name={field.id}
                      rules={[{ required: field.required, message: `Please enter ${field.name}!` }]}
                    >
                      <InputItem
                        type={field.options ? "SELECT" : field.valueType}
                        placeholder={field.description || field.name}
                        name={field.id}
                        options={field.options}
                        onChange={field.valueType === "FILE_RESOURCE" ? handleUpload : null}
                      />
                    </Form.Item>
                  );
                })}
              </div>
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
            {formFields?.sections
              ?.map((item) => item?.dataElements)
              .flat(Infinity)
              ?.map((element) => {
                return (
                  <div key={element.id}>
                    {element.name?.includes("Attachment") ? (
                      openView?.dataValues?.find((dataValue) => dataValue.dataElement === element.id)?.value && (
                        <>
                          <h4>{element.name}</h4>
                          <a
                            href={`/api/40/events/files?dataElementUid=${element.id}&eventUid=${openView?.event}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Download Attachment
                          </a>
                        </>
                      )
                    ) : (
                      <>
                        <h4>{element.name}</h4>
                        <p>{openView?.dataValues?.find((dataValue) => dataValue.dataElement === element.id)?.value}</p>
                      </>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </Modal>
    </div>
  );
}
