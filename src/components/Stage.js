import React from "react";
import { Form, Button, Tooltip } from "antd";
import { useSelector } from "react-redux";
import Section from "./Section";
import InputItem from "./InputItem";
import { createUseStyles } from "react-jss";
import { statusColor } from "../lib/helpers";

const useStyles = createUseStyles({
  form: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    padding: "1rem",
    "& > div": {
      width: "48%",
    },
  },
  submit: {
    margin: "1rem",
  },
});

export default function Stage({
  handleChange,
  handleFinish,
  formValues,
  index,
}) {
  const classes = useStyles();
  const [form] = Form.useForm();

  const event = formValues?.[0]?.dataElements?.[0]?.event;
  const status = formValues?.[0]?.status;

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={(value) => handleChange(value, event)}
      onFinish={(values) => handleFinish(values, event)}
    >
      {formValues?.map((section) => (
        <div
          style={{
            display:
              index === 0 || (index > 0 && section?.repeating)
                ? "block"
                : "none",
          }}
        >
          {/* {console.log("section", section)} */}
          <Section key={section.id} title={section.title} />
          <div className={classes.form}>
            {section?.dataElements?.map((dataElement) => (
              <Tooltip
                title={
                  status === "COMPLETED"
                    ? "You can't edit this field because the stage is completed. If you want to edit this field, you need to open the stage."
                    : null
                }
                key={dataElement.id}
              >
                <Form.Item
                  label={dataElement.name}
                  name={dataElement.id}
                  valuePropName={
                    dataElement?.valueType === "BOOLEAN" ? "checked" : "value"
                  }
                  rules={[
                    {
                      required:
                        (dataElement?.required && index === 0) ||
                        (index > 0 &&
                          section?.repeating &&
                          dataElement?.required),
                      message: `Please enter ${dataElement.name}`,
                    },
                    dataElement?.validator
                      ? { validator: eval(dataElement.validator) }
                      : null,
                  ]}
                  defaultValue={dataElement?.value}
                >
                  <InputItem
                    type={
                      dataElement?.optionSet ? "SELECT" : dataElement?.valueType
                    }
                    options={dataElement?.optionSet?.options?.map((option) => ({
                      label: option.displayName,
                      value: option.code,
                    }))}
                    placeholder={`Enter ${dataElement.name}`}
                    name={dataElement.id}
                    defaultValue={dataElement?.value}
                    disabled={status === "COMPLETED"}
                  />
                </Form.Item>
              </Tooltip>
            ))}
          </div>
        </div>
      ))}
      {(status === "ACTIVE" || status === "SCHEDULE") && (
        <Button className={classes.submit} type="primary" htmlType="submit">
          {status === "COMPLETED" ? "Open" : "Complete"}
        </Button>
      )}
    </Form>
  );
}
