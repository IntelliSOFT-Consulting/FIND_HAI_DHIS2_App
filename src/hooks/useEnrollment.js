import { useDataEngine } from "@dhis2/app-runtime";
import { format } from "date-fns";
import { message } from "antd";
import { attributes } from "../contants/ids";

export default function UseEnrollment() {
  const engine = useDataEngine();

  const createEnrollment = async (patientId, program, orgUnit, date = format(new Date(), "yyyy-MM-dd")) => {
    try {
      const { response } = await engine.mutate({
        resource: "enrollments",
        type: "create",
        data: {
          trackedEntityInstance: patientId,
          program,
          orgUnit,
          enrollmentDate: date,
          incidentDate: date,
          occurredAt: date,
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
