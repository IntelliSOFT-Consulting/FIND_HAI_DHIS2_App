import { useDataEngine } from "@dhis2/app-runtime";
import { setProgramValues } from "../redux/actions";
import { useDispatch } from "react-redux";
import { notification } from "antd";

export default function UseGetInstanceValues({ instanceId, program, organisationUnit }) {
  const engine = useDataEngine();
  const dispatch = useDispatch();

  const getInstanceValues = async () => {
    try {
      const { trackedEntityInstances } = await engine.query({
        trackedEntityInstances: {
          resource: "trackedEntityInstances",
          id: instanceId,
          params: {
            program: program?.id,
            ou: organisationUnit,
            fields: "*",
          },
        },
      });
      const attributes = trackedEntityInstances?.attributes;

      const eventsData = trackedEntityInstances?.enrollments[0]?.events;

      const datas = {};

      attributes?.forEach((attribute) => {
        datas[attribute.attribute] = attribute.value;
      });

      eventsData?.forEach((event) => {
        event?.dataValues?.forEach((dataValue) => {
          datas[dataValue.dataElement] = dataValue.value;
        });
      });

      dispatch(setProgramValues(datas));
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Something went wrong",
      });
    }
  };

  return { getInstanceValues };
}
