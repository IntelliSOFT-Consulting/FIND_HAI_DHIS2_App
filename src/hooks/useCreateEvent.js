import { useDataEngine } from "@dhis2/app-runtime";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function UseCreateEvent() {
  const engine = useDataEngine();
  const { stage, trackedEntityInstance, enrollment } = useParams();
  const { program } = useSelector((state) => state.forms);
  const { id } = useSelector((state) => state.orgUnit);

  const createEvent = async (programStage = null, values = []) => {
    try {
      const { response } = await engine.mutate({
        resource: `events`,
        type: "create",
        data: {
          events: [
            {
              program: program,
              programStage: stage || programStage,
              trackedEntityInstance,
              orgUnit: id,
              enrollment,
              status: "ACTIVE",
              dataValues: values,
              eventDate: new Date().toISOString().slice(0, 10),
            },
          ],
        },
      });
      return response?.importSummaries[0]?.reference;
    } catch (error) {
      return error?.details?.response?.importSummaries[0]?.description;
    }
  };

  return { createEvent };
}
