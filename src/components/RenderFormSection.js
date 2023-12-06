import InputItem from "./InputItem";
import React, { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import { evaluateShowIf } from "../lib/helpers";

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
  submitButton: {
    margin: "1rem",
    backgroundColor: "#026C26 !important",
    color: "white",
    borderColor: "#026C26 !important",
    "&:hover": {
      backgroundColor: "#026C26 !important",
      color: "white !important",
    },
  },
  cancelButton: {
    margin: "1rem",
    backgroundColor: "#B10606",
    color: "white",
    borderColor: "#B10606 !important",
    "&:hover": {
      backgroundColor: "#B10606 !important",
      color: "white !important",
    },
  },
  formList: {
    margin: "1rem",
    border: "1px dashed #ccc",
    padding: "1rem",
    borderRadius: "5px",
  },
  fullWidth: {
    width: "100% !important",
    "& > div": {
      width: "100% !important",
    },
  },
  add: {
    padding: "1rem",
  },
});

const RenderFormSection = ({ section, Form, form, saveValue }) => {
  const [formValues, setFormValues] = useState({});
  const classes = useStyles();

  const setInitialValues = async () => {
    const values = {};
    for (const dataElement of section?.dataElements) {
      values[dataElement.id] = dataElement.value;
    }
    setFormValues(values);
  };

  useEffect(() => {
    setInitialValues();
  }, []);

  return (
    <div className={`${classes.form} ${form.repeatable ? classes.formList + " " + classes.fullWidth : ""}`}>
      {section.dataElements.map((dataElement, index) => {
        const shouldShow = !dataElement.showif || evaluateShowIf(dataElement.showif, formValues);
        return shouldShow ? (
          <Form.Item
            key={index}
            label={dataElement.name}
            name={dataElement.id}
            rules={[
              {
                required: dataElement.required,
                message: `Please input ${dataElement.name}!`,
              },
            ]}
          >
            <InputItem
              type={dataElement.optionSet ? "SELECT" : dataElement.valueType}
              options={dataElement.optionSet?.options?.map((option) => ({
                label: option.name,
                value: option.code,
              }))}
              // defaultValue={dataElement.value}
              placeholder={dataElement.name}
              onChange={async (e) => {
                const value = e?.target ? e.target.value : e;
                await saveValue(value, dataElement, section);
                setFormValues(form.getFieldsValue());
              }}
            />
          </Form.Item>
        ) : null;
      })}
    </div>
  );
};

export default RenderFormSection;
