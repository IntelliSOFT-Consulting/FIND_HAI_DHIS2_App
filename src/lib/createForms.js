import { formatAttributeValues } from "./helpers";

const mapAttributes = (attributes, stageId = undefined) => {
  return attributes?.map(({ id, name, displayName, valueType, optionSet, attributeValues }) => {
    const options = optionSet?.options?.map(({ displayName: label, code: value }) => ({ label, value }));
    return {
      id,
      name: name || displayName,
      valueType,
      options,
      stageId,
      ...formatAttributeValues(attributeValues),
    };
  });
};

export const createRegistrationForm = (program) => {
  return program?.programSections?.map(({ name: sectionName, id: sectionId, trackedEntityAttributes }) => {
    const dataElements = mapAttributes(trackedEntityAttributes);
    return {
      sectionName,
      sectionId,
      dataElements,
    };
  });
};

export const createStagesForms = (program) => {
  return program?.programStages?.map(
    ({ name: stageName, access, id: stageId, programStageSections, repeatable, attributeValues: stageAttributes }) => {
      const sections = programStageSections?.map(({ id, displayName: sectionName, dataElements }) => {
        const elements = mapAttributes(dataElements, stageId);
        return {
          id,
          sectionName,
          elements,
          access: access?.data,
          stageId: stageId,
        };
      });

      return {
        stageName,
        stageId,
        access: access?.data,
        sections,
        repeatable,
        ...formatAttributeValues(stageAttributes),
      };
    }
  );
};

const filterParentStages = (stageForms) => {
  return stageForms.filter((stage) => !stage.parentstage);
};

const mapSurgeryForms = (parentStages, stageForms) => {
  return parentStages.map((stage) => {
    const childStages = stageForms.filter((item) => item.parentstage === stage.stageId);
    const sortedStages = [stage, ...childStages]?.sort((a, b) => a.sort - b.sort);

    const sections = sortedStages.flatMap((item) => {
      const sameStageSections = item.sections.filter((section) => section.stageId === item.stageId);

      const sameStageSectionsWithParent = sameStageSections.map((section) => {
        return {
          ...section,
          parent: item.stageId,
        };
      });

      return {
        stage: {
          title: item.stageName,
          stageId: item.stageId,
          multiple: item.multiple,
          sections: sameStageSectionsWithParent,
          repeatable: item.repeatable,
        },
      };
    });


    return {
      title: stage.stageName,
      stageId: stage.stageId,
      multiple: stage.multiple,
      sections: sections,
    };
  });
};

export const formatSurgeryForms = (program) => {
  const stageForms = createStagesForms(program);
  const registrationForm = createRegistrationForm(program);

  const parentStages = filterParentStages(stageForms);
  const surgeryForms = mapSurgeryForms(parentStages, stageForms);

  return {
    registrationForm,
    surgeryForms,
  };
};
