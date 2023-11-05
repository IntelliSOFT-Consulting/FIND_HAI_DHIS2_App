import React from "react";
import { useDataEngine } from "@dhis2/app-runtime";

export default function UseDataStore() {
  const engine = useDataEngine();

  const getData = async (nameSpace, key = "") => {
    const query = {
      resource: `dataStore/${nameSpace}${key ? "/" + key : ""}`,
    };
    const { data } = await engine.query(query);
    return data;
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
