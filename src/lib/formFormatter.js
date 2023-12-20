import { formatValue } from "./mapValues";

export const formatForm = (stage, values) => {
  const formattedFormValues = {};

  stage?.sections?.forEach((section) => {
    if (section?.repeatable && section.stageId !== "IbB9QEgQU6D") {
      const sectionValues = values?.filter((value) => value?.programStage === section?.stageId);

      formattedFormValues[section?.stageId] = sectionValues?.map((value) => {
        return section.dataElements?.reduce((acc, currDataElement) => {
          const itemValue = value?.dataValues?.find((dataValue) => dataValue?.dataElement === currDataElement?.id)?.value;
          return {
            ...acc,
            [currDataElement?.id]: itemValue === undefined ? null : formatValue(itemValue),
          };
        }, {});
      });
    } else {
      const sectionValues = values?.find((value) => value?.programStage === section?.stageId);
      section?.dataElements?.forEach((dataElement) => {
        const formattedValue = formatValue(
          sectionValues?.dataValues?.find((value) => value?.dataElement === dataElement?.id)?.value
        );
        formattedFormValues[dataElement?.id] = formattedValue === undefined ? null : formattedValue;
      });
    }
  });

  return formattedFormValues;
};
