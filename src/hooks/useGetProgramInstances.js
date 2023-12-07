import { useDataEngine } from "@dhis2/app-runtime";

const UseGetProgramInstances = () => {
  const engine = useDataEngine();

  const getProgramValues = async (programId, programStage, orgUnit) => {
    try {
      const { events } = await engine.query({
        events: {
          resource: `trackedEntityInstances/query.json?ou=${orgUnit}&program=${programId}&programStage=${programStage}&pageSize=1000&order=created:desc`,
        },
      });

      return { events };
    } catch (error) {
      return { error };
    }
  };

  const searchPatient = async (programId, key, value) => {
    try {
      const { tei } = await engine.query({
        tei: {
          resource: `trackedEntityInstances`,
          params: {
            fields: ["attributes[*]", "enrollments[*]"],
            ouMode: "ALL",
            program: programId,
            filter: `${key}:eq:${value}`,
          },
        },
      });

      const enrolled = tei?.trackedEntityInstances?.filter((item) => item.enrollments?.length);
      return enrolled?.map((item) => ({
        ...item.enrollments[0],
        attributes: item.attributes,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  return { getProgramValues, searchPatient };
};

export default UseGetProgramInstances;
