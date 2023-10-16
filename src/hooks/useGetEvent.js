import { useDataEngine } from "@dhis2/app-runtime";

export default function UseGetEvent() {
  const engine = useDataEngine();

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
          value:
            dataValue?.value === "true"
              ? true
              : dataValue?.value === "false"
              ? false
              : dataValue?.value,
        })),
      };
    } catch (error) {
      console.log(error);
    }
  };

  return { getEvent };
}
