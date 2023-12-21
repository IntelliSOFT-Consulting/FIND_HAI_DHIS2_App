import React from "react";
import { Button, Popconfirm } from "antd";
import InputItem from "./InputItem";
import { createUseStyles } from "react-jss";
import { PlusOutlined, MinusCircleOutlined, MinusCircleTwoTone } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { evaluateShowIf, evaluateValidations } from "../lib/helpers";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";

dayjs.extend(weekday);
dayjs.extend(localeData);

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
    position: "relative",
  },

  delete: {
    position: "absolute",
    bottom: "-10px",
    right: "5px",
    color: "#B10606",
    fontSize: "1.5rem",
    cursor: "pointer",
    zIndex: 10,
  },
});

export default function RepeatForm({ Form, form, section, formValues, eventsData }) {
  const classes = useStyles();

  const attributes = useSelector((state) => state.attributes);
  const dataElements = useSelector((state) => state.dataElements);

  const attributeValues = attributes?.reduce((acc, curr) => {
    return {
      ...acc,
      [curr?.id]: curr?.value,
    };
  }, {});

  return (
    <Form.List name={section?.stageId}>
      {(fields, { add, remove }) => (
        <>
          {fields.map((field, index) => (
            <div className={classes.formList} key={field.key}>
              {section?.dataElements?.map((dataElement) => {
                const shouldShow =
                  !dataElement?.showif || evaluateShowIf(dataElement?.showif, formValues?.[section?.stageId]?.[index]);
                if (field.key > 0 && section.title === "Antimicrobial Susceptibility Testing") {
                  if (formValues && formValues?.[section?.stageId] && !formValues?.[section?.stageId]?.[index]) {
                    const prevValues = { ...formValues?.[section?.stageId]?.[0] };

                    const antibioticId = dataElements?.find((dataElement) => dataElement?.name === "Antibiotic")?.id;
                    const astResultId = dataElements?.find((dataElement) => dataElement?.name === "AST result")?.id;
                    delete prevValues[antibioticId];
                    delete prevValues[astResultId];

                    form.setFieldValue([section?.stageId, index], prevValues);
                  }
                }
                return (
                  shouldShow && (
                    <Form.Item
                      {...field}
                      key={dataElement?.id}
                      label={dataElement?.name}
                      name={[field.name, dataElement?.id]}
                      rules={[
                        {
                          required: dataElement?.required,
                          message: `${dataElement?.name} is required.`,
                        },
                        {
                          validator: (_, value) => {
                            if (dataElement?.unique) {
                              const otherValues = formValues?.[section?.stageId]?.filter((item, idx) => idx !== index);
                              const otherValuesWithSameValue = otherValues?.filter((item) => item?.[dataElement?.id] === value);
                              if (otherValuesWithSameValue?.length > 0) {
                                return Promise.reject(new Error(`${dataElement?.name} with value ${value} already selected.`));
                              }
                            }
                            return Promise.resolve();
                          },
                        },
                        ...evaluateValidations(
                          dataElement.validator,
                          dataElement.valueType,
                          { ...formValues, ...formValues?.[section?.stageId]?.[index], ...attributeValues },
                          dataElements
                        ),
                      ]}
                      className={section?.dataElements?.length === 1 ? classes.fullWidth : null}
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
                  )
                );
              })}
              {index > 0 && (
                <Popconfirm
                  title={"Are you sure you want to delete this section?"}
                  onConfirm={() => {
                    remove(field.name);
                  }}
                  className={classes.delete}
                  icon={<MinusCircleOutlined />}
                >
                  <MinusCircleTwoTone className={classes.delete} twoToneColor="#B10606" />
                </Popconfirm>
              )}
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
