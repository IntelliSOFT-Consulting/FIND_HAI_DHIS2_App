import React from "react";
import { useDataEngine } from "@dhis2/app-runtime";

export default function UseGetEnrollmentsData() {
  const engine = useDataEngine();

  const getEnrollmentData = async (patientId, enrollment, isNew = false) => {
    try {
      const { events } = await engine.query({
        events: {
          resource: `trackedEntityInstances/${patientId}`,
          params: {
            fields: "enrollments[*]",
          },
        },
      });

      if (isNew) {
        return events?.enrollments[0];
      }
      return events?.enrollments?.find(
        (enroll) => enroll.enrollment === enrollment
      );
    } catch (error) {
      console.log("error", error);
    }
  };

  return { getEnrollmentData };
}
