import { useDataEngine } from "@dhis2/app-runtime";
import { format } from "date-fns";
import { message } from 'antd';

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
          enrollmentDate: format(new Date(), "yyyy-MM-dd"),
          incidentDate: format(new Date(), "yyyy-MM-dd"),
          status: "ACTIVE",
        },
      });
      return response?.importSummaries[0]?.reference;
    } catch (error) {
      message.error("Error creating enrollment");
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
      message.error("Error updating enrollment");
    }
  };

  return { createEnrollment, updateEnrollment };
}
