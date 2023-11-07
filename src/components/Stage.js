import React, { useState } from "react";
import { Form, Button } from "antd";
import { useSelector } from "react-redux";
import Section from "./Section";
import InputItem from "./InputItem";
import { createUseStyles } from "react-jss";
import { statusColor } from "../lib/helpers";
import RepeatForm from "./RepeatForm";
import UseUpdateEnrollment from "../hooks/useUpdateEnrollment";
import { useNavigate } from "react-router-dom";

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
    backgroundColor: "#026C26 !important",
    color: "white",
    borderColor: "#026C26 !important",
    "&:hover": {
      backgroundColor: "#026C26 !important",
      color: "white !important",
    },
  },
  cancel: {
    margin: "1rem",
    backgroundColor: "#B10606",
    color: "white",
    borderColor: "#B10606 !important",
    "&:hover": {
      backgroundColor: "#B10606 !important",
      color: "white !important",
    },
  },
});

export default function Stage({ handleChange, handleFinish, stageForm, repeatable, formValues, surgeryLink }) {
  const [allValues, setAllValues] = useState(formValues);
  const classes = useStyles();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const event = stageForm?.[0]?.dataElements?.[0]?.event;
  const status = stageForm?.[0]?.status;

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={(_, values) => setAllValues(values)}
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
                    onChange={(e) => {
                      handleChange({ [dataElement.id]: e?.target ? e.target.value : e });
                    }}
                    defaultValue={formValues?.[dataElement.id]}
                  />
                </Form.Item>
              ))
            )}
          </div>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          className={classes.cancel}
          onClick={() => {
            navigate(surgeryLink);
          }}
        >
          Cancel
        </Button>
        <Button className={classes.submit} htmlType="submit">
          Save
        </Button>
      </div>
    </Form>
  );
}
