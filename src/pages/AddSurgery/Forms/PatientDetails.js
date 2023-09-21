import { Collapse, Form } from "antd";
import React from "react";

export default function PatientDetails() {
  return (
    <Collapse
      items={[
        {
          key: "0",
          label: "PATIENT DETAILS",
          children: (
            <Form>
              <div>Forms</div>
            </Form>
          ),
        },
      ]}
    />
  );
}
