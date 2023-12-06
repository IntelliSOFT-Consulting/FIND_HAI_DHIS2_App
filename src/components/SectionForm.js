import React, { useState, useEffect } from "react";
import { Form } from "antd";
import Section from "./Section";
import RenderFormSection from "./RenderFormSection";

const SectionForm = ({ section, className, saveValue, validate, isLastSection, setValidationErrors, setIsValidating }) => {
  const [form] = Form.useForm();

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

  return (
    <Form initialValues={initialValues(section)} layout="vertical" className={className} name={section?.event} form={form}>
      <Section title={section?.title} />
      <RenderFormSection section={section} Form={Form} form={form} saveValue={saveValue} />
    </Form>
  );
};

export default SectionForm;
