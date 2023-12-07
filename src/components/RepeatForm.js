import React from "react";
import { Button } from "antd";
import InputItem from "./InputItem";
import { createUseStyles } from "react-jss";
import { PlusOutlined } from "@ant-design/icons";

const useStyles = createUseStyles({
  fullWidth: {
    width: "100% !important",
  },
  submit: {
    width: "100% !important",
  },
  formList: {
    margin: "1rem 0px",
    width: "100% !important",
    border: "1px dashed #ccc",
    padding: "1rem",
    borderRadius: "5px",
  },
});

export default function RepeatForm({ Form, section, formValues }) {
  const classes = useStyles();

  return (
    <Form.List name={section?.sectionId}>
      {(fields, { add }) => (
        <>
          {fields.map((field, index) => (
            <div className={classes.formList} key={field.key}>
              {section?.dataElements?.map((dataElement) => (
                <Form.Item
                  {...field}
                  key={dataElement?.id}
                  label={dataElement?.name}
                  name={[field.name, dataElement?.id]}
                  valuePropName={dataElement?.valueType === "BOOLEAN" ? "checked" : "value"}
                  rules={[
                    {
                      required: dataElement?.required,
                      message: `${dataElement?.name} is required.`,
                    },
                  ]}
                  className={section?.dataElements?.length === 1 ? classes.fullWidth : null}
                  // hidden={
                  //   dataElement?.showif &&
                  //   allValues?.[section?.sectionId] &&
                  //   (!allValues?.[section?.sectionId][index]?.[dataElement?.showif] ||
                  //     !allValues?.[section?.sectionId][index]?.[dataElement?.showif]?.includes("Other") ||
                  //     allValues?.[section?.sectionId][index]?.[dataElement?.showif] !== true)
                  // }
                >
                  <InputItem
                    type={dataElement?.optionSet ? "SELECT" : dataElement?.valueType}
                    options={dataElement?.optionSet?.options?.map((option) => ({
                      label: option.displayName,
                      value: option.code,
                    }))}
                    placeholder={`Enter ${dataElement.name}`}
                    name={dataElement.id}
                    defaultValue={formValues?.[section?.sectionId][index]?.[dataElement?.id]}
                  />
                </Form.Item>
              ))}
            </div>
          ))}
          <Form.Item className={classes.submit}>
            <Button
              type="dashed"
              onClick={async () => {
                add();
              }}
              block
              icon={<PlusOutlined />}
            >
              ADD {section?.title.toUpperCase()}
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
}
