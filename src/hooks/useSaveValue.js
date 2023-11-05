import React from "react";
import { useDataEngine } from "@dhis2/app-runtime";

export default function UseSaveValue() {
  const engine = useDataEngine();

  const saveValue = async (event, value, dataElement, orgUnit, program, programStage) => {
    try {
      const response = await engine.mutate({
        resource: `events/${event}/${dataElement}`,
        type: "update",
        data: {
          event,
          orgUnit,
          program,
          programStage,
          dataValues: [
            {
              dataElement,
              value,
            },
          ],
        },
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  };

  return { saveValue };
}
