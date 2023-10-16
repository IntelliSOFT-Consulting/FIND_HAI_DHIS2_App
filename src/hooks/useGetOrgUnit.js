import React from "react";
import { useDataEngine } from "@dhis2/app-runtime";
import { setOrgUnit } from "../redux/actions";
import { useDispatch } from "react-redux";

export default function UseGetOrgUnit() {
  const engine = useDataEngine();
  const dispatch = useDispatch();

  const getOrgUnit = async () => {
    try {
      const { organisationUnits } = await engine.query({
        organisationUnits: {
          resource: "organisationUnits",
          params: {
            fields: ["id", "name"],
            filter: "name:ilike:pcea",
          },
        },
      });
      dispatch(setOrgUnit(organisationUnits?.organisationUnits[0]));
    } catch (error) {
      console.log("error", error);
    }
  };

  return { getOrgUnit };
}
