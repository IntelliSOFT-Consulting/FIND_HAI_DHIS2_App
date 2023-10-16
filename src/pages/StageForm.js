import React, { useEffect, useState } from "react";
import { Table, Button, Form, Tooltip } from "antd";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import UseGetEnrollmentsData from "../hooks/UseGetEnrollmentsData";
import { isValidDate } from "../lib/helpers";
import Section from "../components/Section";
import { createUseStyles } from "react-jss";
import CardItem from "../components/CardItem";
import InputItem from "../components/InputItem";
import UseSaveValue from "../hooks/useSaveValue";
import UseGetEvent from "../hooks/useGetEvent";
import UseCompleteEvent from "../hooks/useCompleteEvent";
import { CircularLoader } from "@dhis2/ui";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";

dayjs.extend(weekday);
dayjs.extend(localeData);

const useStyles = createUseStyles({
  header: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  form: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    "& > div": {
      width: "48%",
    },
  },
});

const dateFormat = "YYYY-MM-DD";

export default function StageForm() {
  const [formValues, setFormValues] = useState(null);
  const [status, setStatus] = useState(null);
  const { stages, trackedEntity, program } = useSelector(
    (state) => state.forms
  );
  const { id } = useSelector((state) => state.orgUnit);

  const classes = useStyles();

  const [form] = Form.useForm();

  const { stage, event } = useParams();

  const { saveValue } = UseSaveValue();
  const { getEvent } = UseGetEvent();
  const { completeEvent } = UseCompleteEvent();

  const stageForm = stages?.find((item) => item.id === stage);

  const handleChange = async (value) => {
    const valueKey = Object.keys(value)[0];
    const valueObject = value[valueKey];
    await saveValue(event, valueObject, valueKey, id, program, stage);
  };

  const handleFinish = async (values) => {
    const dataValues = Object.keys(values).map((key) => ({
      dataElement: key,
      value: values[key],
    }));
    const newStatus = status === "COMPLETED" ? "ACTIVE" : "COMPLETED";
    const result = await completeEvent(
      event,
      id,
      program,
      stage,
      dataValues,
      newStatus
    );
    if (result) {
      setStatus((prev) => (prev === "COMPLETED" ? "ACTIVE" : "COMPLETED"));
    }
  };

  const fetchValues = async () => {
    const data = await getEvent(event);
    setStatus(data?.status);
    const values = data?.dataValues?.reduce((acc, curr) => {
      acc[curr.id] = isValidDate(curr.value)
        ? dayjs(curr.value, dateFormat)
        : curr.value;
      return acc;
    }, {});

    setFormValues(values);
  };

  useEffect(() => {
    if (event && event !== "undefined") {
      fetchValues();
    } else {
      setFormValues({});
    }
  }, [event]);

  return (
    <CardItem title={stageForm?.title}>
      {!formValues ? (
        <CircularLoader />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleChange}
          onFinish={handleFinish}
          initialValues={formValues}
        >
          {stageForm?.sections?.map((section) => (
            <>
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
                        dataElement?.valueType === "BOOLEAN"
                          ? "checked"
                          : "value"
                      }
                    >
                      <InputItem
                        type={
                          dataElement?.optionSet
                            ? "SELECT"
                            : dataElement?.valueType
                        }
                        options={dataElement?.optionSet?.options?.map(
                          (option) => ({
                            label: option.displayName,
                            value: option.code,
                          })
                        )}
                        placeholder={`Enter ${dataElement.name}`}
                        name={dataElement.id}
                        defaultValue={form.getFieldValue(dataElement.id)}
                        disabled={status === "COMPLETED"}
                      />
                    </Form.Item>
                  </Tooltip>
                ))}
              </div>
            </>
          ))}
          <Button type="primary" htmlType="submit">
            {status === "COMPLETED" ? "Open" : "Complete"}
          </Button>
        </Form>
      )}
    </CardItem>
  );
}
