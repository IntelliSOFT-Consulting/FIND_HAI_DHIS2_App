import { useDataEngine } from "@dhis2/app-runtime";
import { formatRegistration, formatSurgery } from "../lib/helpers";
import { setForms } from "../redux/actions";
import { useDispatch } from "react-redux";
import { notification } from "antd";
import { createRegistrationForm, createStagesForms, formatSurgeryForms } from "../lib/createForms";

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
              "userGroupAccesses[id,displayName,access]",
              "programStages[id,name,repeatable,access[data],attributeValues[attribute[id,name],value],programStageSections[id,displayName,programStage,description,dataElements[id,displayName,description,attributeValues[attribute[id,name],value],valueType,optionSet[id,displayName,options[id,displayName,code]]]]]",
              "programSections[name,trackedEntityAttributes[id,name,searchable,description,attributeValues[attribute[id,name],value],valueType,optionSet[options[displayName, code]]]",
            ],
            filter: "name:ilike:hai",
          },
        },
      });

      const program = programs?.programs[0];



      const formatSurgeries = formatSurgeryForms(program);

      dispatch(
        setForms({
          registration: formatSurgeries?.registrationForm,
          stages: formatSurgeries?.surgeryForms,
          trackedEntityType: program?.trackedEntityType,
          program: program?.id,
          access: program?.userGroupAccesses,
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
