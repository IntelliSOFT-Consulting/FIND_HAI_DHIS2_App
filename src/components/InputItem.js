import React from "react";
import { Input, Radio, Select, DatePicker } from "antd";

export default function InputItem({ type, name, ...props }) {
  const renderInput = () => {
    switch (type) {
      case "TEXT":
        return <Input name={name} {...props} />;
      case "BOOLEAN":
        return (
          <Radio.Group name={name} {...props}>
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        );
      case "SELECT":
        return <Select showSearch name={name} {...props} />;
      case "DATE":
        return (
          <DatePicker
            name={name}
            {...props}
            format="YYYY-MM-DD"
            style={{
              width: "100%",
            }}
          />
        );
      default:
        return <Input name={name} {...props} />;
    }
  };
  return renderInput();
}
