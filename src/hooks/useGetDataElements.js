import { useDataEngine } from "@dhis2/app-runtime";

const useGetDataElements = () => {
  const engine = useDataEngine();
  const getDataElements = async () => {
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
  };

    return { getDataElements };
};

export default useGetDataElements;
