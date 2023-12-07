import { useDataEngine } from "@dhis2/app-runtime";

const useDeleteEvent = () => {
  const engine = useDataEngine();

  return async (event) => {
    const mutation = {
      resource: `events/${event}`,
      type: "delete",
    };

    await engine.mutate(mutation);
  };
};

export default useDeleteEvent;