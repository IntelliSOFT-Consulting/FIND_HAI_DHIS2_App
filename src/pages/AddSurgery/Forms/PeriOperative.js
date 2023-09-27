import React, { useEffect, useState } from "react";
import { Collapse, Form, Button, Row, Col } from "antd";
import DynamicFormInput from "./DynamicFormInput";
import { useDataEngine } from "@dhis2/app-runtime";
import {
  formItemLayout,
  headingStyles,
  formStyle,
  buttonField,
  buttonStyle,
} from './Styles';
import { fieldMappings } from "./fieldMappings";


export default function PeriOperative() {
  const [form] = Form.useForm();
  const engine = useDataEngine();
  const [storeData, setStoreData] = useState();

  async function fetchData() {
    const { programs } = await engine.query({
      programs: {
        resource: "programs",
        params: {
          filter: "name:ilike:Surgical Site",
          paging: false,
          fields:
            "name,id,programTrackedEntityAttributes[id,name,valueType],programStages[id,name,programStageDataElements[dataElement[name,id,valueType,optionSet[id,name,options[id,name,code]]]]",
        },
      },
    });
    setStoreData(programs.programs);
  }

  useEffect(() => {
    fetchData();
  }, []);

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
