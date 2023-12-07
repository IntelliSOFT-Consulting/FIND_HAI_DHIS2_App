import InputItem from "./InputItem";
import React, { useEffect, useState } from "react";
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

const RenderFormSection = ({ section, Form, form, saveValue, events }) => {
  const [formValues, setFormValues] = useState({});
  const [warnings, setWarnings] = useState(null);
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

  const eventsValues = events?.flatMap((event) => {
    const values = {};
    for (const dataValue of event?.dataValues) {
      values[dataValue.dataElement] = dataValue.value;
    }
    return values;
  });

  return (
    <div className={`${classes.form} ${form.repeatable ? classes.formList + " " + classes.fullWidth : ""}`}>
      {section.dataElements.map((dataElement, index) => {
        const shouldShow = !dataElement.showif || evaluateShowIf(dataElement.showif, formValues);
        if (!shouldShow) {
          form.setFieldValue(dataElement.id, null);
        }
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
              placeholder={dataElement.name}
              status={warnings?.id === dataElement.id ? "error" : null}
              onChange={async (e) => {
                const value = e?.target ? e.target.value : e;
                if (
                  dataElement.name === "Preoperative Antibiotic Prophylaxis" ||
                  dataElement.name === "Postoperative Antibiotic Prophylaxis"
                ) {
                  const existingValue = eventsValues?.find((eventValue) => eventValue[dataElement.id] === value);
                  if (existingValue) {
                    setWarnings({
                      id: dataElement.id,
                      message: `${value} already exists in another section. Please check your data.`,
                    });
                    form.setFieldValue(dataElement.id, null);
                  } else {
                    setWarnings(null);
                    await saveValue(value, dataElement, section);
                    form.setFieldValue(dataElement.id, value);
                  }
                } else {
                  await saveValue(value, dataElement, section);
                }

                setFormValues(form.getFieldsValue());
              }}
            />
            {warnings?.id === dataElement.id && (
              <div style={{ color: "red", fontSize: "0.8rem", marginTop: "0.5rem" }}>{warnings?.message}</div>
            )}
          </Form.Item>
        ) : null;
      })}
    </div>
  );
};

export default RenderFormSection;
