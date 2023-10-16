import React from "react";
import { Input, Radio, Select, DatePicker } from "antd";
import moment from "moment";

export default function InputItem({ type, ...props }) {
  const renderInput = () => {
    switch (type) {
      case "TEXT":
        return <Input {...props} />;
      case "BOOLEAN":
        return (
          <Radio.Group {...props}>
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        );
      case "SELECT":
        return <Select {...props} />;
      case "DATE":
        return (
          <DatePicker
            {...props}
            format="YYYY-MM-DD"
            style={{
              width: "100%",
            }}
            disabledDate={(current) => {
              return current && current > moment().endOf("day");
            }}
          />
        );
      default:
        return <Input {...props} />;
    }
  };
  return renderInput();
}
