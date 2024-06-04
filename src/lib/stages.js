export const getFullEvents = (enrollment, stage, mappings) => {
  const { events } = enrollment;

  if (!stage) {
    return events;
  }

  const stageMappings = mappings
    .filter((mapping) => mapping.programStage === stage?.stageId && mapping.parentEvent === mapping.event)
    ?.map((mapping) => mapping.event);

  const fullEvents = events.filter((event) => stageMappings.includes(event.event));

  return {
    ...stage,
    events: fullEvents?.map((event) => ({
      ...event,
      repeatable: stage?.repeatable,
      multiple: stage?.multiple,
    })),
  };
};

export const isAddStageActive = (stage, enrollmentData) => {
  const events = getFullEvents(stage)?.events?.filter((event) => event?.dataValues?.length > 0);
  return stage?.repeatable && !stage?.multiple && events?.length > 0 && events?.length < 3 && enrollmentData?.status === "ACTIVE";
};
