import { Collapse } from "antd";
import React from "react";
import {
  formItemLayout,
  headingStyles,
  formStyle,
  buttonField,
  buttonStyle,
} from './Styles';

export default function PeriOperative() {
  return (
    <Collapse
      items={[
        {
          key: "1",
          label: "PERI-OPERATIVE",
          children: <div>HELLO</div>,
        },
      ]}
    />
  );
}
