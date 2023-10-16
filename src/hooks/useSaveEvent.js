import React from "react";
import { useDataEngine } from "@dhis2/app-runtime";

const UseSaveEvent = ({ programId, programStage, orgUnit }) => {
  const engine = useDataEngine();

  const saveEvent = async (event, enrollment = false) => {
    try {
      const response = await engine.mutate({
        resource: enrollment ? "trackedEntityInstances" : "events",
        type: "create",
        data: event,
      });

      return { response };
    } catch (error) {
      return { error };
    }
  };

  return { saveEvent };
};

export default UseSaveEvent;
