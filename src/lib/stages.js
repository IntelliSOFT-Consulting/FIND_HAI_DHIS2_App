export const getFullEvents = (stage) => {
  const { events } = stage;
  const fullEvents = events.filter((event) => event.dataValues?.length > 0);
  const nonRepeatingSections = stage.sections.filter((section) => !section.repeating);

  const nonRepeatingDataElements = nonRepeatingSections.flatMap((section) =>
    section.dataElements?.map((dataElement) => dataElement.id)
  );

  const eventsWithValuesOutsideRepeatingSections =
    fullEvents?.length > 1
      ? fullEvents.filter((event) => {
          const dataValues = event.dataValues || [];
          const dataElements = dataValues.map((dataValue) => dataValue.dataElement);

          const dataElementsIsNonRepeating = dataElements.filter((dataElement) =>
            nonRepeatingDataElements?.includes(dataElement)
          );
          return dataElementsIsNonRepeating?.length > 0;
        })
      : fullEvents;

  return {
    ...stage,
    events: eventsWithValuesOutsideRepeatingSections,
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

export const createPayload = (values) => {
  const store = localStorage.getItem("stageValues");
  const initialValues = store ? JSON.parse(store) : {};
  return Object.keys(values)
    .filter((key) => Array.isArray(values[key]))
    .flatMap((field) =>
      values[field].map((submission, index) => {
        let eventId = null;
        const formattedSubmission = Object.entries(submission).map(([key, value]) => {
          const event = initialValues[field][index] ? Object.keys(initialValues[field][index])[0]?.split(".")[1] : null;

          if (event) {
            eventId = event;
          }
          return { dataElement: key, value };
        });

        const eventMetadata = eventId ? { event: eventId } : { status: "ACTIVE" };

        return { ...eventMetadata, dataValues: formattedSubmission };
      })
    );
};
