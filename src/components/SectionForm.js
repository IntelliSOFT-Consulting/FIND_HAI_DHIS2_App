import React, { useEffect, useState } from "react";
import { Form, Popconfirm, Spin } from "antd";
import { MinusCircleTwoTone } from "@ant-design/icons";
import Section from "./Section";
import RenderFormSection from "./RenderFormSection";
import { createUseStyles } from "react-jss";
import useDeleteEvent from "../hooks/useDeleteEvent";
import {useSelector} from "react-redux";

const useStyles = createUseStyles({
  container: {
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

const SectionForm = ({
  section,
  className,
  saveValue,
  validate,
  setValidationErrors,
  setIsValidating,
  index,
  getEnrollment,
  events,
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const classes = useStyles();

  const deleteEvent = useDeleteEvent();

  const handleValidate = async () => {
    try {
      setIsValidating(true);
      setValidationErrors([]);
      await form.validateFields();
    } catch (err) {
      setValidationErrors((prev) => (!prev.length ? err.errorFields : [...prev, ...err.errorFields]));
    }
  };

  useEffect(() => {
    if (validate) {
      handleValidate();
    }
  }, [validate]);

  const initialValues = (sectionData) => {
    const values = {};
    for (const dataElement of sectionData?.dataElements) {
      values[dataElement.id] = dataElement.value;
    }
    return values;
  };

  const deletable = className && index > 0;

  const isDisabled = events?.some((event) => event?.status === "COMPLETED");

  return (
    <div className={classes.container}>
      {deletable && !isDisabled && (
        <Popconfirm
          title={"Are you sure you want to delete this section?"}
          onConfirm={async () => {
            setLoading(true);
            await deleteEvent(section?.event);
            await getEnrollment();
            setLoading(false);
          }}
        >
          <MinusCircleTwoTone className={classes.delete} twoToneColor="#B10606" />
        </Popconfirm>
      )}
      <Spin spinning={loading} tip="Deleting section...">
        <Form
          initialValues={initialValues(section)}
          layout="vertical"
          className={className}
          name={section?.event}
          form={form}
          autoComplete={"off"}
          disabled={isDisabled}
        >
          <Section title={section?.title} />
          <RenderFormSection section={section} Form={Form} form={form} saveValue={saveValue} events={events} />
        </Form>
      </Spin>
    </div>
  );
};

export default SectionForm;
