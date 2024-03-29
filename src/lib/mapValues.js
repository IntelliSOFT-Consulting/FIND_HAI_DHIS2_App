import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import { isValidDate } from "./helpers";

dayjs.extend(weekday);
dayjs.extend(localeData);

export const formatValue = (value) => {
  if (value === "true" || value === "false") {
    return JSON.parse(value);
  } else if (isValidDate(value)) {
    return dayjs(value, "YYYY-MM-DD");
  }
  return value;
};

export const formatDisplayValue = (value) => {
  if (value === "true") return "Yes";
  if (value === "false") return "No";
  if (isValidDate(value)) return dayjs(value).format("DD MMM YYYY");
  return value;
};

export const formatValues = (form, dataValues, type=null) => {
  const dataElements = form?.map((section) => {
    if (type === 'enrollment') {
      return {
        ...section,
        dataElements: section?.dataElements?.map((dataElement) => {
          const dataValue = dataValues?.attributes?.find((attribute) => attribute.attribute === dataElement.id);
          return {
            id: dataElement.id,
            name: dataElement.name,
            valueType: dataElement.valueType,
            compulsory: dataElement.compulsory,
            options: dataElement.options,
            value: dataValue?.value,
          };
        }),
      };
    }
    return {
      ...section,
      dataElements: section?.elements?.map((dataElement) => {
        const dataValue = dataValues?.dataValues?.find((dataValue) => dataValue.dataElement === dataElement.id);
        return {
          id: dataElement.id,
          name: dataElement.name,
          valueType: dataElement.valueType,
          required: dataElement.compulsory,
          options: dataElement.options,
          value: dataValue?.value,
        };
      }),
    };
  });

  return dataElements;
};
