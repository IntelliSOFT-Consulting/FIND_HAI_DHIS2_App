import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { formatValue } from "../lib/mapValues";

export default function useViewData() {
  const [enrollment, setEnrollment] = useState({});
  const { stages } = useSelector((state) => state.forms);
  const { stage } = useParams();

  const findStageForm = (stageId, stages) => stages?.find((item) => item.id === stageId);

  const findStageEvents = (enroll, stage) => enroll?.events?.filter((item) => item.programStage === stage);

  const findNonRepeatingSectionEvents = (events, nonRepeatableElements) =>
    events?.filter((event) => {
      const eventValues = event.dataValues?.map((item) => item.dataElement);
      return eventValues.some((item) => nonRepeatableElements?.includes(item));
    });

  const findInitialValues = (section, enrollment, nonRepeatableElements) => {
    const initialValues = {};
    section.dataElements.forEach((element) => {
      const events = findNonRepeatingSectionEvents(enrollment?.events, nonRepeatableElements);
      const event = events?.find((item) => item.dataValues.some((value) => value.dataElement === element.id));
      if (event) {
        const value = event.dataValues.find((item) => item.dataElement === element.id);
        initialValues[element.id] = value.value;
      }
    });
    return initialValues;
  };

  const findRepeatingSectionValues = (section, enrollment, stage) => {
    const sectionDataElements = section.dataElements.map((item) => item.id);
    const events = findStageEvents(enrollment, stage)?.filter((event) => {
      const eventValues = event.dataValues.map((item) => item.dataElement);
      return eventValues.some((item) => sectionDataElements?.includes(item));
    });

    const initialValues = {};
    if (events?.length > 0) {
      initialValues[section.sectionId] = events.map((event) => {
        const values = event.dataValues.filter((item) => sectionDataElements?.includes(item.dataElement));
        return values.reduce((acc, curr) => {
          acc[curr.dataElement] = curr.value;
          return acc;
        }, {});
      });
    }

    return initialValues;
  };

  const findDataViewModel = (stageForm, enrollment, nonRepeatableElements) => {
    if (!stageForm || !enrollment) return [];

    const dataViewModel = [];

    stageForm?.sections?.forEach((section) => {
      section.dataElements.forEach((element) => {
        const initialValues = section.repeating
          ? findRepeatingSectionValues(section, enrollment, stage)
          : findInitialValues(section, enrollment, nonRepeatableElements);

        const dataElement = {
          id: element.id,
          name: element.name,
          value: initialValues[section.sectionId]
            ? initialValues[section.sectionId]
                ?.map((item) => formatValue(item[element.id]))
                ?.filter((item) => item !== undefined && item !== null && item !== "")
                ?.join(", ")
            : initialValues[element.id],
          sectionId: section.sectionId,
        };
        dataViewModel.push(dataElement);
      });
    });

    return {
      ...stageForm,
      sections: stageForm.sections.map((section) => {
        return {
          ...section,
          dataElements: section.dataElements.map((element) => {
            const dataElement = dataViewModel.find((item) => item.id === element.id);
            return {
              ...element,
              value: dataElement?.value?.toString()?.replace(/true/g, "Yes")?.replace(/false/g, "No"),
              key: dataElement?.id,
            };
          }),
        };
      }),
    };
  };

  const stageForm = findStageForm(stage, stages);
  const nonRepeatableSections = stageForm?.sections?.filter((item) => !item.repeating);
  const nonRepeatableElements = nonRepeatableSections?.flatMap((section) => section.dataElements?.map((item) => item.id));

  return {
    enrollment,
    setEnrollment,
    dataViewModel: findDataViewModel(stageForm, enrollment, nonRepeatableElements),
  };
}
