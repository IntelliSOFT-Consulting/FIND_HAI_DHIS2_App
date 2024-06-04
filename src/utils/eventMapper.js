export const filterEventsCategory = (repeats, mainEventId, events) => {
  const mainEventIds = repeats.filter((repeat) => repeat.parentEvent === mainEventId).map((repeat) => repeat.event);
  return mainEventId ? events.filter((event) => mainEventIds.includes(event.event)) : events;
};

export const groupSameStageEvents = (programStage, events) => {
  return events.filter((event) => event.programStage === programStage);
};
