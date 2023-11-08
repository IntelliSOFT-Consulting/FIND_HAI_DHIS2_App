import React from "react";
import { useDataEngine } from "@dhis2/app-runtime";

export default function UseCompleteEvent() {
  const engine = useDataEngine();

  const completeEvent = async (event, orgUnit, program, programStage, dataValues, status) => {
    try {
      const resource = status === 'ACTIVE' ? 'events' : 'completeEvents';
      const response = await engine.mutate({
        resource: `events/${event}`,
        type: "update",
        data: {
          event,
          orgUnit,
          program,
          programStage,
          status,
          completedDate: new Date(),
          dataValues,
        },
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  };

  return { completeEvent };
}
