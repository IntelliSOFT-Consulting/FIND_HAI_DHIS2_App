import { useDataEngine } from "@dhis2/app-runtime";

export default function UseProgram() {
  const engine = useDataEngine();

  const getPrograms = async () => {
    const query = {
      programs: {
        resource: "programs",
        params: {
          fields: [
            "id",
            "name",
            "trackedEntityType",
            "programStages[id,name,repeatable,attributeValues[attribute[id,name],value],programStageDataElements[id,dataElement[id,name,description,valueType,optionSet[id,displayName,options[id,displayName,code]]]]]",
            "programTrackedEntityAttributes",
          ],
        },
      },
    };

    const { programs } = await engine.query(query);
    return programs?.programs;
  };

  return { getPrograms };
}
