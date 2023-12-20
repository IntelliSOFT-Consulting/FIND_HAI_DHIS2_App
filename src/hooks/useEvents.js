import { useDataEngine } from "@dhis2/app-runtime";
import { format } from "date-fns";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function UseEvents() {
  const engine = useDataEngine();

  const { program } = useSelector((state) => state.forms);
  const { trackedEntityInstance, enrollment } = useParams();
  const { id } = useSelector((state) => state.orgUnit);

  const completeEvent = async (event, orgUnit, program, programStage, dataValues, status) => {
    try {
      // const resource = status === "ACTIVE" ? "events" : "completeEvents";
      const response = await engine.mutate({
        resource: `events/${event}`,
        type: "update",
        data: {
          event,
          orgUnit,
          program,
          programStage,
          status,
          completedDate: new Date(),
          dataValues,
        },
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const completeAllEvents = async (events) => {
    try {
      if (events.length > 0) {
        const completedEvents = events.map((event) => ({
          ...event,
          status: "COMPLETED",
          completedDate: format(new Date(), "yyyy-MM-dd"),
        }));

        const response = await engine.mutate({
          resource: `events`,
          type: "create",
          params: {
            strategy: "UPDATE",
          },
          data: {
            events: completedEvents,
          },
        });

        return response;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const activateAllEvents = async (events) => {
    try {
      if (events.length > 0) {
        const completedEvents = events.map((event) => ({
          ...event,
          status: "ACTIVE",
          completedDate: null,
        }));

        const response = await engine.mutate({
          resource: `events`,
          type: "create",
          params: {
            strategy: "UPDATE",
          },
          data: {
            events: completedEvents,
          },
        });

        return response;
      }
    } catch (error) {
      console.log(error);
    }
  };

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
      console.log("ERROR", error);
      return error?.details?.response?.importSummaries[0]?.description;
    }
  };

  const deleteEvent = async (event) => {
    const mutation = {
      resource: `events/${event}`,
      type: "delete",
    };

    await engine.mutate(mutation);
  };

  const updateEvent = async (event, value, dataElement, orgUnit, program, programStage) => {
    try {
      const response = await engine.mutate({
        resource: `events/${event}/${dataElement}`,
        type: "update",
        data: {
          event,
          orgUnit,
          program,
          programStage,
          dataValues: [
            {
              dataElement,
              value,
            },
          ],
        },
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const getEvent = async (event) => {
    try {
      const { event: data } = await engine.query({
        event: {
          resource: `events/${event}`,
        },
      });

      return {
        ...data,
        dataValues: data?.dataValues?.map((dataValue) => ({
          id: dataValue?.dataElement,
          dataElement: dataValue?.dataElement,
          value: dataValue?.value === "true" ? true : dataValue?.value === "false" ? false : dataValue?.value,
        })),
      };
    } catch (error) {
      console.log(error);
    }
  };

  const createEvents = async (events) => {
    try {
      const { response } = await engine.mutate({
        resource: `events`,
        type: "create",
        params: {
          strategy: "CREATE_AND_UPDATE",
        },
        data: {
          events,
        },
      });

      return response?.importSummaries?.map((summary) => summary?.reference);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteEvents = async (events) => {
    try {
      const { response } = await engine.mutate({
        resource: `events`,
        type: "create",
        params: {
          strategy: "DELETE",
        },
        data: {
          events,
        },
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  };

  return {
    completeEvent,
    completeAllEvents,
    activateAllEvents,
    createEvent,
    createStageEvents,
    deleteEvent,
    updateEvent,
    getEvent,
    createEvents,
    deleteEvents,
  };
}
