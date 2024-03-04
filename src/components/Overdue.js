import React from "react";
import { useSelector } from "react-redux";
import Modal from "./ModalItem";
import { Button, Form } from "antd";
import InputItem from "./InputItem";
import Section from "./Section";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const Overdue = ({ overdue, setOverdue, onFinish, discontinue, setDiscontinue, surgeryLink }) => {
  const { stages } = useSelector((state) => state.forms);
  const outcome = stages?.find((stage) => stage?.title?.toLowerCase()?.includes("outcome"));
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const footer = (
    <div>
      <Button
        onClick={() => {
          navigate(discontinue ? surgeryLink : "/surgeries");
          setOverdue(false);
          setDiscontinue(false);
        }}
      >
        Back
      </Button>
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
    <Modal
      open={overdue || discontinue}
      onClose={() => {
        setOverdue(false);
        setDiscontinue(false);
      }}
      title={overdue ? "This form is overdue" : "Discontinue surveillance"}
      footer={footer}
    >
      <Form form={form} layout="vertical" onFinish={(values) => onFinish(values, outcome?.stageId)}>
        {outcome?.sections?.map((item) => {
          return item.stage.sections.map((section) => {
            return (
              <>
                <Section key={section.id} title={section.title} />
                {section?.elements?.map((dataElement) => (
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
                      {...(dataElement.disablefuturedate
                        ? {
                            disabledDate: (current) => {
                              return current && current > dayjs().endOf("day");
                            },
                          }
                        : {})}
                    />
                  </Form.Item>
                ))}
              </>
            );
          });
        })}
      </Form>
    </Modal>
  );
};

export default Overdue;
