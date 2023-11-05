import React from "react";
import { useDataEngine } from "@dhis2/app-runtime";
import { useParams, useLocation } from "react-router-dom";

export default function UseGetEnrollmentsData() {
  const engine = useDataEngine();
  const { trackedEntityInstance, enrollment } = useParams();
  const { search } = useLocation();

  const params = Object.fromEntries(new URLSearchParams(search.slice(1)));

  const getEnrollmentData = async (tei = null, isNew = false) => {
    try {
      const { events } = await engine.query({
        events: {
          resource: `trackedEntityInstances/${tei || trackedEntityInstance}`,
          params: {
            fields: "enrollments[*]",
          },
        },
      });

      if (isNew) {
        return events?.enrollments[0];
      }
      const userEnrollments = events?.enrollments?.find((enroll) => enroll.enrollment === enrollment);

      // if (params?.event) {
      //   const filtered = userEnrollments?.events?.filter((item) => item?.event === params?.event);
      //   return { ...userEnrollments, events: filtered };
      // }

      return userEnrollments;
    } catch (error) {
      console.log("error", error);
    }
  };

  return { getEnrollmentData };
}
