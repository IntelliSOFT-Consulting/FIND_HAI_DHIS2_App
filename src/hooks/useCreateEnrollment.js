import React from "react";
import { useDataEngine } from "@dhis2/app-runtime";

export default function UseCreateEnrollment() {
  const engine = useDataEngine();

  const createEnrollment = async (patientId, program, orgUnit) => {
    try {
      const { response } = await engine.mutate({
        resource: "enrollments",
        type: "create",
        data: {
          trackedEntityInstance: patientId,
          program,
          orgUnit,
          enrollmentDate: new Date().toISOString(),
          incidentDate: new Date().toISOString(),
          status: "ACTIVE",
        },
      });
      return response;
    } catch (error) {
      console.log("error", error);
    }
  };

  return { createEnrollment };
}
