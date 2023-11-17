export const getFullEvents = (enrollment, stage) => {
  const { events } = enrollment;

  if (!stage) {
    return events;
  }
  const fullEvents = events.filter((event) => event.programStage === stage?.stageId);

  return {
    ...stage,
    events: fullEvents?.map((event) => ({
      ...event,
      repeatable: stage?.repeatable,
      repeattype: stage?.repeattype,
    })),
  };
};

export const isAddStageActive = (stage, enrollmentData) => {
  const events = getFullEvents(stage)?.events?.filter((event) => event?.dataValues?.length > 0);
  return (
    stage?.repeatable &&
    (!stage?.repeattype || (stage?.repeattype && stage?.repeattype !== "section")) &&
    events?.length > 0 &&
    events?.length < 3 &&
    enrollmentData?.status === "ACTIVE"
  );
};
