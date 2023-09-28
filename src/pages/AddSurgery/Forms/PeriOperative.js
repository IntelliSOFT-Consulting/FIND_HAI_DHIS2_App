import React, { useEffect, useState } from "react";
import { Collapse, Form, Button, Input, DatePicker, Select, Row, Col } from "antd";
import {DynamicFormInput, renderInputField} from "./DynamicFormInput";
import { useDataEngine } from "@dhis2/app-runtime";
import {
  formItemLayout,
  headingStyles,
  headingStylesPERI,
  SurgicalHandStyle,
  CancelbuttonStyle,
  AddSurgicalHandProcedureBtn,
  formStyle,
  buttonField,
  buttonStyle,
} from './Styles';
import { fieldMappings } from "./fieldMappings";


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
      if (periOperativeProgram.programStages && periOperativeProgram.programStages.length > 0) {
        const periOperativeStage = periOperativeProgram.programStages.find(stage => stage.name === "PERI-OPERATIVE");
        if (periOperativeStage) {
          setPeriOperativeFields(periOperativeStage.programStageDataElements || []);
        }
      }
    }
    setStoreData(programs.programs);
  }

  useEffect(() => {
    fetchData();
  }, []);

  console.log(storeData);

  const renderRiskFactors = () => {
    const field = periOperativeFields[0].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Risk Factors <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="RiskFactors"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderBloodGlucoseLevels = () => {
    const field = periOperativeFields[2].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Blood glucose levels (Mmol/L) <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="BloodGlucoseLevels"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderBloodGlucoseMesured = () => {
    const field = periOperativeFields[1].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Blood glucose measured? <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="BloodGlucoseMesured"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderIntervention = () => {
    const field = periOperativeFields[3].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Intervention to correct blood sugar, if any <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="Intervention"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderPreOPBath = () => {
    const field = periOperativeFields[4].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Pre-op bath/shower <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="PreOPBath"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderHairRemoval = () => {
    const field = periOperativeFields[6].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Hair removal <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="HairRemoval"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderAntibacterialSoapUsed = () => {
    const field = periOperativeFields[5].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Antibacterial soap used <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="AntibacterialSoapUsed"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderHairRemovalDate= () => {
    const field = periOperativeFields[7].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Hair removal date <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="HairRemovalDate"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderChlorhexidineAlcohol= () => {
    const field = periOperativeFields[8].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Chlorhexidine + Alcohol <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="ChlorhexidineAlcohol"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderIodineaq= () => {
    const field = periOperativeFields[11].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Iodine-aq <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="Iodineaq"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderIodineAlcohol= () => {
    const field = periOperativeFields[9].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Iodine + Alcohol <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="IodineAlcohol"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderSkinFullyDry= () => {
    const field = periOperativeFields[12].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Was the skin allowed to fully dry? <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="SkinFullyDry"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderChlorhexidineaq = () => {
    const field = periOperativeFields[10].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Chlorhexidine-aq <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="Chlorhexidineaq"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderEstimatedTimeProcedure = () => {
    const field = periOperativeFields[13].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Estimated time spent on the procedure (minutes) <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="EstimatedTimeProcedure"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderAntimicrobialSoapWater = () => {
    const field = periOperativeFields[15].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Antimicrobial soap + water <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="AntimicrobialSoapWater"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderPlainSoapWater = () => {
    const field = periOperativeFields[14].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Plain soap + water <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="PlainSoapWater"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderAlcoholBasedHandRub = () => {
    const field = periOperativeFields[16].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Alcohol-based Hand Rub <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="AlcoholBasedHandRub"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderPreoperativeAntibioticProphylaxis = () => {
    const field = periOperativeFields[17].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Preoperative Antibiotic Prophylaxis <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="PreoperativeAntibioticProphylaxis"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderDrainInserted = () => {
    const field = periOperativeFields[24].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Drain inserted <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="DrainInserted"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderAntibioticGivenPreOp= () => {
    const field = periOperativeFields[18].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              If other antibiotic given during pre-op preparations, specify
            </span>
          }
          name="AntibioticGivenPreOp"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderLocationOfTheDrain= () => {
    const field = periOperativeFields[25].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
             Location of the drain <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="LocationOfTheDrain"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderAntibioticsCeased= () => {
    const field = periOperativeFields[19].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
             Were antibiotics ceased at completion of Surgery? <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="AntibioticsCeased"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderAntibioticGivenPresenceDrain= () => {
    const field = periOperativeFields[26].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
             Antibiotic given in the presence of a drain but no infection <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="AntibioticGivenPresenceDrain"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderPostoperativeAntibioticProphylaxis= () => {
    const field = periOperativeFields[20].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
             Postoperative Antibiotic Prophylaxis <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="PostoperativeAntibioticProphylaxis"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderImplantUsed= () => {
    const field = periOperativeFields[27].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Implant used <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="ImplantUsed"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderOtherAntibioticPostOp= () => {
    const field = periOperativeFields[21].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              If other antibiotic given on the post-operative, specify
            </span>
          }
          name="OtherAntibioticPostOp"
          
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderOtherImplantUsed= () => {
    const field = periOperativeFields[28].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              If other type of implant used, specify
            </span>
          }
          name="OtherImplantUsed"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderReasonForGivingPostoperativeAntibiotics= () => {
    const field = periOperativeFields[22].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              Reason for giving post-operative antibiotics <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="ReasonForGivingPostoperativeAntibiotics"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  const renderOtherReasonForGivingPostoperativeAntibiotics= () => {
    const field = periOperativeFields[23].dataElement;
    return (
      <Col span={12} key={field.id}>
        <Form.Item
        {...formItemLayout}
          label={
            <span>
              If other reason for giving post-operative antibiotics, please specify
            </span>
          }
          name="OtherReasonForGivingPostoperativeAntibiotics"
        >
          {renderInputField(field)}
        </Form.Item>
      </Col>
    );
  };

  return (
    <div>
      {storeData ? (
        <Collapse
          items={[
            {
              key: "1",
              label: "PERI-OPERATIVE",
              children: (
                <Form form={form}>
                  <div style={formStyle}>
                    <Row gutter={16}>
                      {renderRiskFactors()}
                      {renderBloodGlucoseLevels()} 
                    </Row>
                    <Row gutter={16}>
                      {renderBloodGlucoseMesured()}
                      {renderIntervention()}
                    </Row>
                  </div>
                  <div style={headingStylesPERI}>PATIENT PREPARATION</div>
                  <div style={formStyle}>
                    <Row gutter={16}>
                      {renderPreOPBath()}
                      {renderHairRemoval()} 
                    </Row>
                    <Row gutter={16}>
                      {renderAntibacterialSoapUsed()}
                      {renderHairRemovalDate()}
                    </Row>
                  </div>
                  <div style={headingStylesPERI}>SURGICAL SKIN PREPARATION</div>
                  <div style={formStyle}>
                    <Row gutter={16}>
                      {renderChlorhexidineAlcohol()}
                      {renderIodineaq()} 
                    </Row>
                    <Row gutter={16}>
                      {renderIodineAlcohol()}
                      {renderSkinFullyDry()}
                    </Row>
                    <Row gutter={16}>
                      {renderChlorhexidineaq()}
                    </Row>
                  </div>
                  <div style={SurgicalHandStyle}>
                    <div style={headingStylesPERI}>SURGICAL HAND PREPARATION</div>
                    <div style={formStyle}>
                      <Row gutter={16}>
                        {renderEstimatedTimeProcedure()}
                        {renderAntimicrobialSoapWater()} 
                      </Row>
                      <Row gutter={16}>
                        {renderPlainSoapWater()}
                        {renderAlcoholBasedHandRub()}
                      </Row>
                      <Row gutter={16}>
                        {renderChlorhexidineaq()}
                      </Row>
                    </div>
                    <div style={buttonField}>
                      <Button type="primary" size="large" style={AddSurgicalHandProcedureBtn}>Add</Button>
                    </div>
                  </div>
                  <div style={headingStylesPERI}>PRE AND POST OPERATIVE ANTIBIOTICS</div>
                  <div style={formStyle}>
                    <Row gutter={16}>
                      {renderPreoperativeAntibioticProphylaxis()}
                      {renderDrainInserted()} 
                    </Row>
                    <Row gutter={16}>
                      {renderAntibioticGivenPreOp()}
                      {renderLocationOfTheDrain()}
                    </Row>
                    <Row gutter={16}>
                      {renderAntibioticsCeased()}
                      {renderAntibioticGivenPresenceDrain()}
                    </Row>
                    <Row gutter={16}>
                      {renderPostoperativeAntibioticProphylaxis()}
                      {renderImplantUsed()}
                    </Row>
                    <Row gutter={16}>
                      {renderOtherAntibioticPostOp()}
                      {renderOtherImplantUsed()}
                    </Row>
                    <Row gutter={16}>
                      {renderReasonForGivingPostoperativeAntibiotics()}
                    </Row>
                    <Row gutter={16}>
                      {renderOtherReasonForGivingPostoperativeAntibiotics()}
                    </Row>
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
                    <Button
                      style={buttonStyle}
                      type="success"
                      size="large"
                    >
                      SAVE
                    </Button>
                  </Form.Item>
                  
                </div>
                </Form>
              ),
            },
          ]}
        />
      ) : (
        <p>Loading form...</p>
      )}
    </div>
   
  );
}

