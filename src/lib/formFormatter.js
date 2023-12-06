import { formatValue } from "./mapValues";

const processSection = (section, event) => {
  const { event: ev, status, trackedEntityInstance, enrollment, enrollmentStatus, orgUnit, program, programStage } = event;

  return {
    title: section.title,
    stageId: event.programStage,
    event: ev,
    status,
    trackedEntityInstance,
    enrollment,
    enrollmentStatus,
    orgUnit,
    program,
    programStage,
    dataElements: section.dataElements.map((dataElement) => {
      const dataElementValue = event?.dataValues?.find((dataValue) => dataValue.dataElement === dataElement.id);
      return {
        ...dataElement,
        value: formatValue(dataElementValue?.value),
      };
    }),
  };
};

export const formatForm = (form, events) => {
  const mainEventValue = events?.find((event) => event.programStage === form.stageId && form.sections) || {};

  form.sections = form?.sections?.map((section) => mainEventValue && processSection(section, mainEventValue)) || [];

  const childrenFormsDataFlattened = (form?.children || []).flatMap((childForm) =>
    (events || [])
      .filter((eventItem) => eventItem.programStage === childForm.stageId)
      .map((eventItem) => {
        const childFormCopy = { ...childForm };
        childFormCopy.sections = childFormCopy.sections.map((section) => processSection(section, eventItem));
        return childFormCopy;
      })
  );

  const groupedChildrenFormsDataFlattened = childrenFormsDataFlattened.reduce((acc, form) => {
    const stageId = form.title;
    acc[stageId] = [...(acc[stageId] || []), form];
    return acc;
  }, {});

  return [form, groupedChildrenFormsDataFlattened];
};
