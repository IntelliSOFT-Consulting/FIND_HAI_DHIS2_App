import React from "react";
import { DatePicker, Input, Select, Form } from "antd";
import "./PatientDetails.css";

const inputStyles = {
  width: "80%",
  height: "40px",
};

const displayBlock = { display: "block", marginBottom: "5px" };

export default function DynamicFormInput({ data, fieldName, fieldMappings, label, formItemProps }) {
  if (!data || data.length === 0) {
    return null;
  }

  const fieldElement = data.find((element) => element.name === fieldName);

  if (!fieldElement) {
    return null;
  }

  const valueType = fieldElement.valueType?.toUpperCase();

  const renderInputField = () => {
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
      default:
        return <Input type="text" className="input-field-with-shadow" style={inputStyles} />;
    }
  };

  return (
    <div>
      <label htmlFor={fieldElement.id} style={displayBlock}>
        {label}
      </label>
      <Form.Item {...formItemProps} name={fieldName}>
        {renderInputField()}
      </Form.Item>
    </div>
  );
}