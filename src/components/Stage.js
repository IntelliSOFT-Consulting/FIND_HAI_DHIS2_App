import React from "react";
import { Form, Button, Tooltip } from "antd";
import { useSelector } from "react-redux";
import Section from "./Section";
import InputItem from "./InputItem";
import { createUseStyles } from "react-jss";
import { statusColor } from "../lib/helpers";
import RepeatForm from "./RepeatForm";
import UseUpdateEnrollment from "../hooks/useUpdateEnrollment";

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

export default function Stage({ handleChange, handleFinish, stageForm, repeatable, formValues }) {
  const classes = useStyles();
  const [form] = Form.useForm();

  const event = stageForm?.[0]?.dataElements?.[0]?.event;
  const status = stageForm?.[0]?.status;

  const { updateEnrollment } = UseUpdateEnrollment();

  const handleOverdue = async (values, stage) => {
    const payload = Object.keys(values).map((key) => ({
      dataElement: key,
      value: values[key],
    }));

    const event = await createEvent(stage, payload);
    if (event) {
      const updatedEnrollmentData = {
        ...enrollmentData,
        status: "CANCELLED",
      };
      delete updatedEnrollmentData?.events;

      await updateEnrollment(enrollment, updatedEnrollmentData);
      getEnrollment();
    }
  };

  console.log("formValues: ", formValues)

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={(value) => handleChange(value)}
      onFinish={(values) => handleFinish(values, event)}
      initialValues={formValues}
    >
      {stageForm?.sections?.map((section) => (
        <div key={section.id}>
          <Section key={section.id} title={section.title} />
          <div className={classes.form}>
            {section?.repeating ? (
              <RepeatForm Form={Form} form={form} section={section} />
            ) : (
              section?.dataElements?.map((dataElement) => (
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
                    valuePropName={dataElement?.valueType === "BOOLEAN" ? "checked" : "value"}
                    rules={[
                      {
                        required: dataElement?.required,
                        message: `Please enter ${dataElement.name}`,
                      },
                      dataElement?.validator ? { validator: eval(dataElement.validator) } : null,
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
                      defaultValue={formValues?.[dataElement.id]}
                      disabled={status === "COMPLETED"}
                    />
                  </Form.Item>
                </Tooltip>
              ))
            )}
          </div>
        </div>
      ))}
      <Button className={classes.submit} type="primary" htmlType="submit">
        Submit
      </Button>
    </Form>
  );
}
