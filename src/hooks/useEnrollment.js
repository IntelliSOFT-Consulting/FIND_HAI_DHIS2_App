import { useDataEngine } from "@dhis2/app-runtime";

export default function UseEnrollment() {
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
      return response?.importSummaries[0]?.reference;
    } catch (error) {
      console.log("error", error);
    }
  };

  const updateEnrollment = async (enrollment, data) => {
    try {
      const response = await engine.mutate({
        resource: `enrollments/${enrollment}`,
        type: "update",
        data: {
          ...data,
        },
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  };

  return { createEnrollment, updateEnrollment };
}
