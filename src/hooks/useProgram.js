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

  const getFeedback = async () => {
    const query = {
      feedback: {
        resource: "programs",
        params: {
          filter: "name:ilike:feedback",
          fields: "id,name,programStages[name,id,programStageSections[name,id,dataElements[*,optionSet[options[displayName,code]]]]]",
        },
      },
    };

    const { feedback } = await engine.query(query);

    const formatForm = (program) => {
      const sections = program?.programStages[0]?.programStageSections?.flatMap((section) => {
        return {
          id: section?.id,
          name: section?.name,
          dataElements: section.dataElements?.map((element) => {
            const options = element?.optionSet?.options?.map((option) => {
              return {
                label: option?.displayName,
                value: option?.code,
              };
            });
            return {
              id: element?.id,
              name: element?.name,
              description: element?.description,
              valueType: element?.valueType,
              options,
            };
          }),
        };
      });

      return {
        id: program?.id,
        name: program?.name,
        stage: program?.programStages[0]?.id,
        sections,
      };
    };

    return formatForm(feedback?.programs[0]);
  };

  return { getPrograms, getFeedback };
}
