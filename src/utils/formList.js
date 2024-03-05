export const formLister = (program) => {
  const attributes = program?.programTrackedEntityAttributes;
  const stages = program?.programStages;

  const formList = [];
  attributes.forEach((attribute) => {
    const attributeValues = attribute?.attributeValues;
    formList.push({
      id: attribute.id,
      name: attribute.name?.replace(program?.name, "").trim(),
      description: attribute.description,
      valueType: attribute.valueType,
      optionSet: attribute.optionSet,
      options: attribute.optionSet?.options,
      repeatable: false,
      stage: null,
      program: program.id,
      trackedEntityType: program.trackedEntityType,
      type: "registration",
      attributeValues: attributeValues,
    });
  });

  stages.forEach((stage) => {
    const dataElements = stage?.programStageDataElements;
    dataElements.forEach((element) => {
      const attributeValues = element?.attributeValues;
      formList.push({
        id: element.id,
        name: element.displayName?.replace(program?.name, "").trim(),
        description: element.description,
        valueType: element.valueType,
        optionSet: element.optionSet,
        options: element.optionSet?.options,
        repeatable: stage.repeatable,
        stage: stage.id,
        stageName: stage.name,
        program: program.id,
        type: "stage",
        attributeValues: attributeValues,
        repeatable: stage.repeatable,
      });
    });
  });

  return formList;
};
