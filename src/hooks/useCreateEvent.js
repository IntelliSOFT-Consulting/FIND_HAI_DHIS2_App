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
              programStage: programStage || stage,
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

  const createStageEvents = async (stageIds, values = []) => {
    try {
      const { response } = await engine.mutate({
        resource: `events`,
        type: "create",
        data: {
          events: stageIds.map((stageId) => ({
            program: program,
            programStage: stageId,
            trackedEntityInstance,
            orgUnit: id,
            enrollment,
            status: "ACTIVE",
            dataValues: values || [],
            eventDate: new Date().toISOString().slice(0, 10),
          })),
        },
      });
      return response?.importSummaries?.map((summary) => summary?.reference);
    } catch (error) {
      return error?.details?.response?.importSummaries[0]?.description;
    }
  };

  return { createEvent, createStageEvents };
}
