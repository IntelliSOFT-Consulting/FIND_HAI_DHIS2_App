export const getSectionMappings = (mappings, eventId) => mappings?.filter((mapping) => mapping.parentEvent === eventId);

export const getSectionEvents = (enrollmentData, sectionMappings, eventId) =>
  eventId
    ? enrollmentData?.events?.filter((event) => sectionMappings?.some((mapping) => mapping.event === event.event))
    : enrollmentData?.events;

export const getNonRepeatingEvents = (sectionEvents, nonRepeatingStages) =>
  sectionEvents?.filter((event) => nonRepeatingStages.some((stage) => stage.stageId === event.programStage));

export const getRepeatingEvents = (sectionEvents, repeatingStages) =>
  sectionEvents?.filter((event) => repeatingStages.some((stage) => stage.stageId === event.programStage));

export const getUpdatedEvents = (nonRepeatingEvents, nonRepeatingStages, values) =>
  nonRepeatingEvents.map((event) => {
    const datas = {};
    for (const dataElement of nonRepeatingStages
      .filter((stage) => stage.stageId === event.programStage)
      .flatMap((item) => item.dataElements)) {
      datas[dataElement.id] = values[dataElement.id];
    }
    return {
      ...event,
      dataValues: Object.keys(datas).map((key) => ({
        dataElement: key,
        value: datas[key],
      })),
    };
  });

export const getRepeatingValues = (values) =>
  Object.keys(values).reduce((acc, curr) => {
    if (Array.isArray(values[curr])) {
      return {
        ...acc,
        [curr]: values[curr],
      };
    }
    return acc;
  }, {});
