import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { formatValue } from "../lib/mapValues";

export default function useViewData() {
  const [enrollment, setEnrollment] = useState({});
  const [events, setEvents] = useState([]);
  const { stages } = useSelector((state) => state.forms);
  const { stage } = useParams();

  const findStageForm = (stageId, stages) => stages?.find((item) => item.stageId === stageId);

  const formatBoolean = (value) => {
    if (value === "true") return "Yes";
    if (value === "false") return "No";
    return value;
  };

  const findDataViewModel = (stageForm, stageEvents) => {
    if (!stageForm || !stageEvents) return;
    const childSections = stageForm?.children?.flatMap((child) =>
      child?.sections?.map((section) => ({
        ...section,
        stageId: child?.stageId,
        repeatable: true,
      }))
    );
    console.log("ChildSections: ", childSections);
    console.log("StageForm Sections: ", stageForm);
    const flattenedForm = {
      ...stageForm,
      sections: [
        ...stageForm?.sections?.map((item) => ({ ...item, stageId: stageForm.stageId, repeatable: false })),
        ...childSections,
      ],
    };

    const dataView = flattenedForm?.sections?.map((section) => {
      if (!section.repeatable) {
        const sectionEvents = stageEvents?.find((event) => event.programStage === section?.stageId);
        const dataValues = section?.dataElements?.map((element) => {
          const dataValue = sectionEvents?.dataValues?.find((value) => element?.id === value?.dataElement);
          return {
            ...element,
            name: element?.name,
            value: formatBoolean(formatValue(dataValue?.value)) || "-",
          };
        });
        return {
          ...section,
          dataValues,
        };
      }

    //   handle repeatable sections
      const repeatableEvents = stageEvents?.filter((event) => event.programStage === section?.stageId);
      const dataValues = section?.dataElements?.map((element) => {
        const dataValue = repeatableEvents?.flatMap((event) => event?.dataValues)?.find(
          (value) => element?.id === value?.dataElement
        );
        return {
          ...element,
          name: element?.name,
          value: formatBoolean(formatValue(dataValue?.value)) || "-",
        };
      });
      return {
        ...section,
        dataValues,
      };
    });

    return dataView;
  };

  const stageForm = findStageForm(stage, stages);

  return {
    enrollment,
    setEnrollment,
    dataViewModel: findDataViewModel(stageForm, events),
    events,
    setEvents,
  };
}
