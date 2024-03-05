import { useDataEngine } from "@dhis2/app-runtime";
import { message } from "antd";

const useDataElements = () => {
  const engine = useDataEngine();
  const getDataElements = async () => {
    try {
      const query = {
        dataElements: {
          resource: "dataElements",
          params: {
            paging: false,
            fields: "id,name,valueType",
          },
        },
        trackedEntityAttributes: {
          resource: "trackedEntityAttributes",
          params: {
            paging: false,
            fields: "id,name,valueType",
          },
        },
      };

      const { dataElements, trackedEntityAttributes } = await engine.query(query);

      const allDataElements = [...dataElements?.dataElements, ...trackedEntityAttributes?.trackedEntityAttributes];

      return allDataElements?.map((dataElement) => {
        return {
          name: dataElement.name,
          id: dataElement.id,
          valueType: dataElement.valueType,
        };
      });
    } catch (error) {
      message.error("Error fetching data elements");
    }
  };

  return { getDataElements };
};

export default useDataElements;
