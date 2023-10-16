import { useDataEngine } from "@dhis2/app-runtime";

export default function UseCreateEvent() {
  const engine = useDataEngine();

  const createEvent = async (eventData) => {
    try {
      const { response } = await engine.mutate({
        resource: `events`,
        type: "create",
        data: eventData,
      });
      return response?.importSummaries[0]?.reference;
    } catch (error) {
      console.log("error", error);
    }
  };

  return { createEvent };
}
