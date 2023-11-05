import React from "react";
import { useDataEngine } from "@dhis2/app-runtime";

const UseGetProgramInstances = () => {
  const engine = useDataEngine();

  const getProgramValues = async (programId, programStage, orgUnit, filter) => {
    try {
      const { events } = await engine.query({
        events: {
          resource: `trackedEntityInstances/query.json?ou=${orgUnit}&program=${programId}&programStage=${programStage}&pageSize=1000&order=created:desc`,
        },
      });

      return { events };
    } catch (error) {
      return { error };
    }
  };

  return { getProgramValues };
};

export default UseGetProgramInstances;
