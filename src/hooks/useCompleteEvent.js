import { useDataEngine } from "@dhis2/app-runtime";
import { format } from "date-fns";

export default function UseCompleteEvent() {
  const engine = useDataEngine();

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

  return { completeEvent, completeAllEvents, activateAllEvents };
}
