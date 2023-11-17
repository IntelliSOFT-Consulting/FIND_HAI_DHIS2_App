import React, { useState, useEffect } from "react";
import { Form } from "antd";
import Section from "./Section";
import RenderFormSection from "./RenderFormSection";

const SectionForm = ({ section, className, saveValue }) => {
  const [form] = Form.useForm();
  return (
    <Form layout="vertical" className={className} name={section?.event} form={form}>
      <Section title={section?.title} />
      <RenderFormSection section={section} Form={Form} form={form} saveValue={saveValue} />
    </Form>
  );
};

export default SectionForm;
