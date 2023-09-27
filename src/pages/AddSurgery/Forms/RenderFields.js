import React from "react";
import { formItemLayout } from './Styles';
import DynamicFormInput from "./DynamicFormInput";
import { fieldMappings } from "./fieldMappings";

  export const renderPatientIDField = (program) => (
      <DynamicFormInput
        data={program.programTrackedEntityAttributes}
        fieldName="Surgical Site Case Report Form Patient ID"
        fieldMappings={fieldMappings}
        label={
          <span>
            Patient ID <span style={{ color: "red" }}>*</span>
          </span>
        }
        formItemProps={{
          ...formItemLayout,
          name: "PatientID",
          rules: [
            {
              required: true,
              message: "Please input Patient ID",
            },
          ],
        }}
      />
  );

  export const renderSecondaryIDField = (program) => (
    <DynamicFormInput
    data={program.programTrackedEntityAttributes}
    fieldName="Surgical Site Case Report Form Secondary ID"
    fieldMappings={fieldMappings}
    label={
      <span>
        Secondary ID
      </span>
    }
    formItemProps={{
      ...formItemLayout,
      name: "SecondaryID",
      rules: [
        {
          required: false,
          message: "Please input Secondary ID",
        },
      ],
    }}
  />
  );

  export const renderGender = (program) => (
    <DynamicFormInput
    data={program.programTrackedEntityAttributes}
    fieldName="Surgical Site Case Report Form Gender"
    fieldMappings={fieldMappings}
    label={
      <span>
        Gender <span style={{ color: "red" }}>*</span>
      </span>
    }
    formItemProps={{
      ...formItemLayout,
      name: "Gender",
      rules: [
        {
          required: true,
          message: "Please input Gender",
        },
      ],
    }}
  />
  );

  export const renderDateOfBirth = (program) => (
    <DynamicFormInput
    data={program.programTrackedEntityAttributes}
    fieldName="Surgical Site Case Report Form Date of Birth"
    fieldMappings={fieldMappings}
    label={
      <span>
        Date of Birth <span style={{ color: "red" }}>*</span>
      </span>
    }
    formItemProps={{
      ...formItemLayout,
      name: "DateOfBirth",
      rules: [
        {
          required: true,
          message: "Please input Date of Birth",
        },
      ],
    }}
  />
  );

  export const renderDateOfAdmission = (program) => (
    <DynamicFormInput
    data={program.programTrackedEntityAttributes}
    fieldName="Surgical Site Case Report Form Date of Admission"
    fieldMappings={fieldMappings}
    label={
      <span>
        Date of Admission <span style={{ color: "red" }}>*</span>
      </span>
    }
    formItemProps={{
      ...formItemLayout,
      name: "DateOfAdmission",
      rules: [
        {
          required: true,
          message: "Please input Date of Admission",
        },
      ],
    }}
  />
  );

  export const renderDateOfSurgery = (program) => (
    <DynamicFormInput
    data={program.programTrackedEntityAttributes}
    fieldName="Surgical Site Case Report Form Date of Surgery"
    fieldMappings={fieldMappings}
    label={
      <span>
        Date of Surgery <span style={{ color: "red" }}>*</span>
      </span>
    }
    formItemProps={{
      ...formItemLayout,
      name: "DateOfSurgery",
      rules: [
        {
          required: true,
          message: "Please input Date of Surgery",
        },
      ],
    }}
  />
  );

  export const renderSurgicalProcedure = (program) => (
    <DynamicFormInput
    data={program.programTrackedEntityAttributes}
    fieldName="Surgical Site Case Report Form Surgical Procedure"
    fieldMappings={fieldMappings}
    label={
      <span>
        Surgical Procedure <span style={{ color: "red" }}>*</span>
      </span>
    }
    formItemProps={{
      ...formItemLayout,
      name: "SurgicalProcedure",
      rules: [
        {
          required: true,
          message: "Please input Surgical Procedure",
        },
      ],
    }}
  />
  );

  export const renderScheduling = (program) => (
    <DynamicFormInput
    data={program.programTrackedEntityAttributes}
    fieldName="Surgical Site Case Report Form Scheduling"
    fieldMappings={fieldMappings}
    label={
      <span>
        Scheduling <span style={{ color: "red" }}>*</span>
      </span>
    }
    formItemProps={{
      ...formItemLayout,
      name: "Scheduling",
      rules: [
        {
          required: true,
          message: "Please input Scheduling",
        },
      ],
    }}
  />
  );

  export const renderSurgeryLocation = (program) => (
    <DynamicFormInput
    data={program.programTrackedEntityAttributes}
    fieldName="Surgical Site Case Report Form Surgery Location"
    fieldMappings={fieldMappings}
    label={
      <span>
        Surgery Location <span style={{ color: "red" }}>*</span>
      </span>
    }
    formItemProps={{
      ...formItemLayout,
      name: "SurgeryLocation",
      rules: [
        {
          required: true,
          message: "Please input Surgery Location",
        },
      ],
    }}
  />
  );