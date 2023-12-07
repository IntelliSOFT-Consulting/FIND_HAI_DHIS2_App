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

  const findDataViewModel = (stageForm, stageEvents) => {
    if (!stageForm || !stageEvents) return;
    const childSections = stageForm?.children?.flatMap((child) =>
      child?.sections?.map((section) => ({
        ...section,
        stageId: child?.stageId,
        repeatable: true,
      }))
    );

    const stageFormValues = stageForm?.sections?.flatMap((section) => {
      const stageValue = stageEvents?.find((event) => event?.programStage === stageForm?.stageId);

      return section?.dataElements?.map((dataElement) => ({
        ...dataElement,
        stageId: stageForm?.stageId,
        repeatable: false,
        value: formatValue(stageValue?.dataValues?.find((value) => value?.dataElement === dataElement?.id)?.value),
      }));
    });

    const childSectionValues = stageEvents?.flatMap((event) => {
      return childSections?.flatMap((section) => {
        return event?.dataValues?.map((dataValue) => {
          const dataElement = section?.dataElements?.find((element) => element?.id === dataValue?.dataElement);
          return {
            ...dataValue,
            ...dataElement,
            stageId: section?.stageId,
            repeatable: true,
          };
        });
      });
    });

    return {
      mainSection: stageFormValues,
      repeatSections: childSectionValues,
    };
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
