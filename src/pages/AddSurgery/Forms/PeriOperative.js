import React, { useEffect, useState } from "react";
import {
  Collapse,
  Form,
  Button,
  Row,
  Col,
} from "antd";
import { renderInputField } from "./DynamicFormInput";
import { useDataEngine } from "@dhis2/app-runtime";
import {
  formItemLayout,
  headingStylesPERI,
  SurgicalHandStyle,
  CancelbuttonStyle,
  AddSurgicalHandProcedureBtn,
  formStyle,
  buttonField,
  buttonStyle,
} from "./Styles";

export default function PeriOperative() {
  const [form] = Form.useForm();
  const engine = useDataEngine();
  const [storeData, setStoreData] = useState();
  const [periOperativeFields, setPeriOperativeFields] = useState([]);

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

    if (programs && programs.programs && programs.programs.length > 0) {
      const periOperativeProgram = programs.programs[0];
      if (
        periOperativeProgram.programStages &&
        periOperativeProgram.programStages.length > 0
      ) {
        const periOperativeStage = periOperativeProgram.programStages.find(
          (stage) => stage.name === "PERI-OPERATIVE"
        );
        if (periOperativeStage) {
          setPeriOperativeFields(
            periOperativeStage.programStageDataElements || []
          );
        }
      }
    }
    setStoreData(programs.programs);
  }

  useEffect(() => {
    fetchData();
  }, []);

  console.log(storeData);

  const generateFormFields = (fieldIndexes, requiredFieldNames) => {
    return fieldIndexes.map((index) => {
      const field = periOperativeFields[index];

      const isRequired = requiredFieldNames.includes(field.dataElement.name);

      return (
        <Col span={12} key={field.dataElement.id}>
          <Form.Item
            {...formItemLayout}
            label={
              <span>
                {field.dataElement.name}{" "}
                {isRequired && <span style={{ color: "red" }}>*</span>}
              </span>
            }
            name={field.dataElement.id}
            rules={[
              {
                message: `Please enter ${field.dataElement.name}`,
              },
            ]}
          >
            {renderInputField(field.dataElement)}
          </Form.Item>
        </Col>
      );
    });
  };

  return (
    <div>
      <Collapse
        items={[
          {
            key: "1",
            label: "PERI-OPERATIVE",
            children: storeData ? (
              <Form form={form}>
                <div style={formStyle}>
                  <Row gutter={16}>
                    {generateFormFields(
                      [0, 2, 1, 3],
                      [
                        "Risk Factors",
                        "Blood glucose levels (Mmol/L)",
                        "Blood glucose measured?",
                        "Intervention to correct blood sugar, if any",
                      ]
                    )}
                  </Row>
                </div>
                <div style={headingStylesPERI}>PATIENT PREPARATION</div>
                <div style={formStyle}>
                  <Row gutter={16}>
                    {generateFormFields(
                      [4, 6, 5, 7],
                      [
                        "Pre-op bath/shower",
                        "Hair removal",
                        "Antibacterial soap used",
                        "Hair removal date",
                      ]
                    )}
                  </Row>
                </div>
                <div style={headingStylesPERI}>SURGICAL SKIN PREPARATION</div>
                <div style={formStyle}>
                  <Row gutter={16}>
                    {generateFormFields(
                      [8, 11, 9, 12, 10],
                      [
                        "Chlorhexidine +  Alcohol",
                        "Iodine-aq",
                        "Iodine+Alcohol",
                        "Was the skin allowed to fully dry?",
                        "Chlorhexidine-aq",
                      ]
                    )}
                  </Row>
                </div>
                <div style={SurgicalHandStyle}>
                  <div style={headingStylesPERI}>SURGICAL HAND PREPARATION</div>
                  <div style={formStyle}>
                    <Row gutter={16}>
                      {generateFormFields(
                        [13, 15, 14, 16, 10],
                        [
                          "Estimated time spent on the procedure (minutes)",
                          "Antimicrobial soap + water",
                          "Plain soap + water",
                          "Alcohol-based Hand Rub",
                          "Chlorhexidine-aq",
                        ]
                      )}
                    </Row>
                  </div>
                  <div style={buttonField}>
                    <Button
                      type="primary"
                      size="large"
                      style={AddSurgicalHandProcedureBtn}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <div style={headingStylesPERI}>
                  PRE AND POST OPERATIVE ANTIBIOTICS
                </div>
                <div style={formStyle}>
                  <Row gutter={16}>
                    {generateFormFields(
                      [17, 24, 18, 25, 19, 26, 20, 27, 21, 28, 22],
                      [
                        "Preoperative Antibiotic Prophylaxis",
                        "Drain inserted",
                        "Location of the drain",
                        "Were antibiotics ceased at completion of Surgery?",
                        "Antibiotic given in the presence of a drain but no infection",
                        "Postoperative Antibiotic Prophylaxis",
                        "Implant used",
                        "Reason for giving postoperative antibiotics",
                      ]
                    )}
                  </Row>
                  <Row gutter={16}>{generateFormFields([23], [])}</Row>
                </div>
                <div style={buttonField}>
                  <Form.Item>
                    <Button
                      style={CancelbuttonStyle}
                      type="danger"
                      size="large"
                    >
                      CANCEL
                    </Button>
                    <Button style={buttonStyle} type="success" size="large">
                      SAVE
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            ) : (
              <p>Loading form...</p>
            ),
          },
        ]}
      />
    </div>
  );
}
