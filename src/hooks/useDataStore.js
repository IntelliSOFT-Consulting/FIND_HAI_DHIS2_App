import React from "react";
import { useDataEngine } from "@dhis2/app-runtime";

export default function UseDataStore() {
  const engine = useDataEngine();

  const getData = async (nameSpace, key = "") => {
    try {
      const { dataStore } = await engine.query({
        dataStore: {
          resource: `dataStore/${nameSpace}/${key}`,
        },
      });
      return dataStore;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const saveData = async (nameSpace, key, value) => {
    const query = {
      resource: `dataStore/${nameSpace}/${key}`,
      type: "create",
      data: value,
    };
    const { data } = await engine.mutate(query);
    return data;
  };

  return { getData, saveData };
}
