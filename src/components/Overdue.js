import React, { useState } from "react";
import { useSelector } from "react-redux";
import Modal from "./ModalItem";
import { Form, Button } from "antd";
import InputItem from "./InputItem";
import Section from "./Section";
import { useNavigate } from "react-router-dom";

const Overdue = ({ overdue, setOverdue, onFinish }) => {
  const { stages } = useSelector((state) => state.forms);
  const outcome = stages?.find((stage) => stage?.title?.toLowerCase()?.includes("outcome"));
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const footer = (
    <div>
      <Button onClick={() => navigate(-1)}>Back</Button>
      <Button
        type="primary"
        htmlType="submit"
        onClick={() => {
          form.submit();
        }}
      >
        Save
      </Button>
    </div>
  );

  return (
    <Modal open={overdue} onClose={() => setOverdue(false)} title="This form is overdue" footer={footer}>
      <Form form={form} layout="vertical" onFinish={(values) => onFinish(values, outcome?.id)}>
        {outcome?.sections?.map((section) => (
          <>
            <Section key={section.id} title={section.title} />
            {section?.dataElements?.map((dataElement) => (
              <Form.Item
                label={dataElement.name}
                name={dataElement.id}
                valuePropName={dataElement?.valueType === "BOOLEAN" ? "checked" : "value"}
                rules={[
                  {
                    required: dataElement?.required,
                    message: `Please input ${dataElement.name}!`,
                  },
                ]}
              >
                <InputItem
                  type={dataElement?.optionSet ? "SELECT" : dataElement?.valueType}
                  options={dataElement?.optionSet?.options?.map((option) => ({
                    label: option.displayName,
                    value: option.code,
                  }))}
                  placeholder={`Enter ${dataElement.name}`}
                  name={dataElement.id}
                />
              </Form.Item>
            ))}
          </>
        ))}
      </Form>
    </Modal>
  );
};

export default Overdue;
