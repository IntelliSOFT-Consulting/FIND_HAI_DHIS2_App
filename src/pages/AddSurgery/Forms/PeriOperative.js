import { Collapse } from "antd";
import React from "react";

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
