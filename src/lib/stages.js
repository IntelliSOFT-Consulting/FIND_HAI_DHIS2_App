export const getFullEvents = (stage) => {
  const { events } = stage;
  const fullEvents = events.filter((event) => event.dataValues?.length > 0);
  const nonRepeatingSections = stage.sections.filter((section) => !section.repeating);

  const nonRepeatingDataElements = nonRepeatingSections.flatMap((section) =>
    section.dataElements?.map((dataElement) => dataElement.id)
  );

  const eventsWithValuesOutsideRepeatingSections = fullEvents.filter((event) => {
    const dataValues = event.dataValues || [];
    const dataElements = dataValues.map((dataValue) => dataValue.dataElement);

    const dataElementsIsNonRepeating = dataElements.filter((dataElement) => nonRepeatingDataElements?.includes(dataElement));
    return dataElementsIsNonRepeating?.length > 0;
  });

  return {
    ...stage,
    events: eventsWithValuesOutsideRepeatingSections,
  };
};


export const isAddStageActive = (stage, enrollmentData) => {
  const events = stage?.events?.filter((event) => event?.dataValues?.length > 0);
  return (
    stage?.repeatable &&
    (!stage?.repeattype || (stage?.repeattype && stage?.repeattype !== "section")) &&
    events?.length > 0 &&
    events?.length < 3 &&
    enrollmentData?.status === "ACTIVE"
  );
};

