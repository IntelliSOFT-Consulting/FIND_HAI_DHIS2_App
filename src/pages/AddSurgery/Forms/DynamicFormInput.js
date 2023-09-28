import React from "react";
import { DatePicker, Input, Select, Form, Radio, Checkbox } from "antd";
import "./PatientDetails.css";

const inputStyles = {
  width: "80%",
  height: "40px",
};

const displayBlock = { display: "block", marginBottom: "5px" };

export function renderInputField(fieldElement) {
  const valueType = fieldElement.valueType?.toUpperCase();

  switch (valueType) {
    case "DATE":
      return <DatePicker className="input-field-with-shadow" style={inputStyles} />;
    case "TEXT":
      if (fieldElement.optionSet) {
        const options = fieldElement.optionSet.options.map((option) => (
          <Select.Option key={option.id} value={option.code}>
            {option.name}
          </Select.Option>
        ));
        return (
          <Select className="input-field-with-shadow" style={inputStyles}>
            {options}
          </Select>
        );
      } else {
        return <Input type="text" className="input-field-with-shadow" style={inputStyles} />;
      }
    case "BOOLEAN":
      return (
        <Radio.Group>
          <Radio value={true}>Yes</Radio>
          <Radio value={false}>No</Radio>
        </Radio.Group>
      );
    case "NUMBER":
      return <Input type="number" className="input-field-with-shadow" style={inputStyles} />;
    default:
      return <Input type="text" className="input-field-with-shadow" style={inputStyles} />;
  }
}

export default function DynamicFormInput({ data, fieldName, fieldMappings, label, formItemProps }) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const fieldElement = Array.isArray(data) ? data.find((element) => element.name === fieldName) : null;

  if (!fieldElement) {
    return null;
  }

  return (
    <div>
      <label htmlFor={fieldElement.id} style={displayBlock}>
        {label}
      </label>
      <Form.Item {...formItemProps} name={fieldName}>
        {renderInputField(fieldElement)}
      </Form.Item>
    </div>
  );
}