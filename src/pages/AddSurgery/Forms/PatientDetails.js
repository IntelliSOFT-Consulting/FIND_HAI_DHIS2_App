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

const fieldMappings = {
  "Surgical Site Case Report Form Patient ID": {
    label: "Patient ID",
  },
  "Surgical Site Case Report Form Secondary ID": {
    label: "Secondary ID",
  },
  "Surgical Site Case Report Form Gender": {
    label: "Gender",
  },
  "Surgical Site Case Report Form Date of Birth": {
    label: "Date of Birth",
  },
  "Surgical Site Case Report Form Date of Admission": {
    label: "Date of Admission",
  },
  "Surgical Site Case Report Form Date of Surgery": {
    label: "Date of Surgery",
  },
  "Surgical Site Case Report Form Surgical Procedure": {
    label: "Surgical Procedure",
  },
  "Surgical Site Case Report Form Scheduling": {
    label: "Scheduling",
  },
  "Surgical Site Case Report Form Surgery Location": {
    label: "Surgery Location",
  },
};

export default function PatientDetails() {
  const [form] = Form.useForm();
  const engine = useDataEngine();
  const [storeData, setStoreData] = useState();

  const patientData = [
    "Surgical Site Case Report Form Patient ID",
    "Surgical Site Case Report Form Secondary ID",
    "Surgical Site Case Report Form Gender",
    "Surgical Site Case Report Form Date of Birth",
  ];

  const SurgeryInformation = [
    "Surgical Site Case Report Form Date of Admission",
    "Surgical Site Case Report Form Date of Surgery",
    "Surgical Site Case Report Form Surgical Procedure",
    "Surgical Site Case Report Form Scheduling",
    "Surgical Site Case Report Form Surgery Location",
  ];

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

  console.log(storeData);

  const onSave = async () => {
    try {
      const values = await form.validateFields();

      const missingFields = requiredFields.filter(
        (fieldName) => !values[fieldName]
      );

      if (missingFields.length > 0) {
        console.log("Please fill in all required fields:", missingFields);
        return;
      }

      await fetch("{{find_url}}/api/trackedEntityInstances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postPatient),
      });

      console.log("Data posted successfully:", postPatient);
      setSuccessModalVisible(true);
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
    }
  };

  return (
    <div>
      {storeData ? (
        <Collapse
          items={storeData.map((program, index) => ({
            key: index.toString(),
            label: "PATIENT DETAILS",
            children: (
              <Form form={form}>
                <div style={formStyle}>
                  <Row gutter={16}>
                    {patientData.map((fieldName) => {
                      const fieldInfo = fieldMappings[fieldName];
                      if (fieldInfo) {
                        fieldName;
                        return (
                          <Col span={12} key={fieldName}>
                            <Form.Item
                              {...formItemLayout}
                              name={fieldName}
                              rules={[
                                {
                                  required: true,
                                  message: `Please input ${fieldInfo.label}`,
                                },
                              ]}
                            >
                              <DynamicFormInput
                                data={program.programTrackedEntityAttributes}
                                fieldName={fieldName}
                                fieldMappings={fieldMappings}
                                label={fieldInfo.label}
                              />
                            </Form.Item>
                          </Col>
                        );
                      }
                      return null;
                    })}
                  </Row>
                </div>
                <div style={headingStyles}>SURGERY SUMMARY</div>
                <br />
                <div style={formStyle}>
                  <Row gutter={16}>
                    {SurgeryInformation.map((fieldName) => {
                      const fieldInfo = fieldMappings[fieldName];
                      if (fieldInfo) {
                        return (
                          <Col span={12} key={fieldName}>
                            <Form.Item
                              {...formItemLayout}
                              name={fieldName}
                              rules={[
                                {
                                  required: true,
                                  message: `Please input ${fieldInfo.label}`,
                                },
                              ]}
                            >
                              <DynamicFormInput
                                data={program.programTrackedEntityAttributes}
                                fieldName={fieldName}
                                fieldMappings={fieldMappings}
                                label={fieldInfo.label}
                              />
                            </Form.Item>
                          </Col>
                        );
                      }
                      return null;
                    })}
                  </Row>
                </div>
                <div style={buttonField}>
                  <Form.Item>
                    <Button
                      style={buttonStyle}
                      type="success"
                      size="large"
                      onClick={onSave}
                    >
                      Save
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            ),
          }))}
        />
      ) : (
        <p>Loading form...</p>
      )}
    </div>
  );
}
