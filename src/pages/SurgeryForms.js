import React from "react";
import CardItem from "../components/CardItem";
import { createUseStyles } from "react-jss";
import { useParams } from "react-router-dom";
import Forms from "../components/Forms";
import UseGetForms from "../hooks/useGetForms";
import UseGetInstanceValues from "../hooks/useGetInstanceValues";

export default function SurgeryForms({ program, organisationUnits }) {
  const { instanceId, programStageId } = useParams();

  const { forms, trackedEntityType, error } = UseGetForms();
  const { instanceValues, error: instanceError } = UseGetInstanceValues({
    instanceId,
    program,
    organisationUnit: organisationUnits?.id,
  });

  console.log("forms", forms);
  console.log("formValues", instanceValues);

  return (
    <CardItem title="SURGERY DETAILS">
      <div>{forms && JSON.stringify(forms)}</div>
    </CardItem>
  );
}
