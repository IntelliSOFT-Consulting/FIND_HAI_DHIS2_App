import React, { useEffect, useState } from "react";
import { Collapse, Form, Button, Row, Col } from "antd";
import { useDataEngine } from "@dhis2/app-runtime";
import { headingStyles, formStyle, buttonField, buttonStyle } from "./Styles";
import {
  renderPatientIDField,
  renderSecondaryIDField,
  renderGender,
  renderDateOfBirth,
  renderDateOfAdmission,
  renderDateOfSurgery,
  renderSurgicalProcedure,
  renderScheduling,
  renderSurgeryLocation,
} from "./RenderFields";

export default function PatientDetails() {
  const [form] = Form.useForm();
  const engine = useDataEngine();
  const [storeData, setStoreData] = useState();
  const [postData, setPostData] = useState(null);

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

  const requiredFields = [
    "PatientID",
    "Gender",
    "DateOfBirth",
    "DateOfAdmission",
    "DateOfSurgery",
    "SurgicalProcedure",
    "Scheduling",
    "SurgeryLocation",
  ];

  const onSave = async () => {
    try {
      const values = await form.validateFields();

      postData = {
        trackedEntityType: "g47r3pmdiAu",
        orgUnit: "HO8XXXER1ZS",
        attributes: Object.keys(values).map((fieldName) => ({
          attribute: fieldName,
          value: values[fieldName],
        })),
      };

      const missingFields = requiredFields.filter(
        (fieldName) => !values[fieldName]
      );

      if (missingFields.length > 0) {
        console.log("Please fill in all required fields:", missingFields);
        return;
      }

      setPostData(values);

      await fetch("{{find_url}}/api/trackedEntityInstances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      console.log("Data posted successfully:", postData);
      setSuccessModalVisible(true);
    } catch (errorInfo) {
      console.log(postData);
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
                    <Col span={12}>{renderPatientIDField(program)}</Col>
                    <Col span={12}>{renderSecondaryIDField(program)}</Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>{renderGender(program)}</Col>
                    <Col span={12}>{renderDateOfBirth(program)}</Col>
                  </Row>
                </div>
                <div style={headingStyles}>SURGERY SUMMARY</div>
                <br />
                <div style={formStyle}>
                  <Row gutter={16}>
                    <Col span={12}>{renderDateOfAdmission(program)}</Col>
                    <Col span={12}>{renderDateOfSurgery(program)}</Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>{renderSurgicalProcedure(program)}</Col>
                    <Col span={12}>{renderScheduling(program)}</Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>{renderSurgeryLocation(program)}</Col>
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
