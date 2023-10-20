import { useDataEngine } from "@dhis2/app-runtime";
import { formatRegistration, formatSurgery } from "../lib/helpers";
import { setForms } from "../redux/actions";
import { useDispatch } from "react-redux";
import { notification } from "antd";

export default function UseGetForms() {
  const engine = useDataEngine();
  const dispatch = useDispatch();

  const getForms = async () => {
    try {
      const { programs } = await engine.query({
        programs: {
          resource: "programs",
          params: {
            fields: [
              "id",
              "name",
              "trackedEntityType",
              "programStages[id,name,programStageSections[id,displayName,dataElements[id,displayName,description,attributeValues[attribute[id,name],value],valueType,optionSet[id,displayName,options[id,displayName,code]]]]]",
              "programSections[name,trackedEntityAttributes[id,name,searchable,attributeValues[attribute[id,name],value],valueType,optionSet[options[displayName, code]]]",
            ],
            filter: "name:ilike:find",
          },
        },
      });

      const program = programs?.programs[0];

      const registration = formatRegistration(program);

      const surgeries = formatSurgery(program);

      dispatch(
        setForms({
          registration,
          stages: surgeries,
          trackedEntityType: program?.trackedEntityType,
          program: program?.id,
        })
      );
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Something went wrong",
      });
      console.log("error", error);
    }
  };

  return { getForms };
}
