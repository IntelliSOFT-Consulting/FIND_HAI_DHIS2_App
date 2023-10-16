import React from "react";
import { useDataEngine } from "@dhis2/app-runtime";

export default function UseFindPatientInstance() {
  const engine = useDataEngine();

  const findPatientInstance = async (attribute, value, ou, program) => {
    try {
      const params = {};
      if(attribute && value) {
        params.filter = `${attribute}:EQ:${value}`;
      };
      const { trackedEntityInstances } = await engine.query({
        trackedEntityInstances: {
          resource: "trackedEntityInstances.json",
          params: {
            ou,
            program,
            ouMode: "ACCESSIBLE",
            fields:
              "trackedEntityInstance,trackedEntityType,attributes[attribute,value],enrollments[*]",
            ...params,
          },
        },
      });
      return trackedEntityInstances?.trackedEntityInstances[0];
    } catch (error) {
      console.log("error", error);
    }
  };

  return { findPatientInstance };
}
