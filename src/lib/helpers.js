import { format } from "date-fns";

export function tableDataToObject(tableData) {
  const headers = tableData.headers.map((header) => ({
    name: header.name,
    column: header.column,
    type: header.type,
    hidden: header.hidden,
    meta: header.meta,
  }));

  const metaData = {
    names: tableData.metaData.names,
    pager: tableData.metaData.pager,
  };

  const rows = tableData.rows.map((row) => {
    const rowData = {};
    headers.forEach((header, index) => {
      rowData[header.name] = row[index];
    });
    return rowData;
  });

  return {
    headers,
    metaData,
    width: tableData.width,
    height: tableData.height,
    rows,
    headerWidth: tableData.headerWidth,
  };
}

const formatAttributeValues = (attributes) => {
  return attributes.reduce((acc, attributeValue) => {
    const key = attributeValue?.attribute?.name?.toLowerCase();
    if (key) {
      acc[key] = attributeValue.value;
    }
    return acc;
  }, {});
};

export function formatRegistration(program) {
  return {
    title: "PATIENT DETAILS",
    enrollment: true,
    sections: program?.programSections?.map((section) => {
      return {
        title: section.name,
        description: section.description,
        sectionId: section.id,
        dataElements: section.trackedEntityAttributes.map((attribute) => {
          return {
            name: attribute.name,
            id: attribute.id,
            valueType: attribute.valueType,
            optionSet: attribute.optionSet,
            ...formatAttributeValues(attribute.attributeValues),
          };
        }),
      };
    }),
  };
}

export function formatSurgery(program) {
  const allStages = program?.programStages?.map((stage) => ({ ...stage, ...formatAttributeValues(stage?.attributeValues) }));
  const mainStages = allStages?.filter((stage) => !stage?.parentstage);
  const stages = mainStages.map((stage) => {
    const children = allStages.filter((child) => child?.parentstage === stage?.id);
    const repeatable = stage?.repeatable && !stage?.name?.toLowerCase()?.includes("post-operative");
    const stageWithoutChildren = { ...stage };
    delete stageWithoutChildren?.children;
    const stageChildren = repeatable ? [stageWithoutChildren, ...children] : children;
    return repeatable ? { ...stage, programStageSections: [], children: stageChildren } : { ...stage, children: stageChildren };
  });

  const formatStage = (stage) => {
    return {
      title: stage.name,
      description: stage.description,
      stageId: stage.id,
      repeatable: stage.repeatable,
      showif: stage.showif,
      sections: stage.programStageSections?.map((section) => {
        return {
          title: section.displayName,
          sectionId: section.id,
          stageId: stage.id,
          dataElements: section.dataElements.map((dataElement) => {
            return {
              name: dataElement.displayName,
              id: dataElement.id,
              valueType: dataElement.valueType,
              optionSet: dataElement.optionSet,
              ...formatAttributeValues(dataElement.attributeValues),
            };
          }),
        };
      }),
      children: stage.children?.map((child) => formatStage(child)),
    };
  };

  return stages.map((stage) => formatStage(stage));
}

export function generateId() {
  const date = new Date();

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Months are 0-indexed in JavaScript.
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const haiYyMmDdHhMmSs =
    `HAI-${year.toString().slice(2)}-` +
    `${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}-` +
    `${hour.toString().padStart(2, "0")}-${minute.toString().padStart(2, "0")}-${second.toString().padStart(2, "0")}`;

  return haiYyMmDdHhMmSs;
}

export function isValidDate(dateString) {
  if (typeof dateString !== "string") return false;

  const regEx = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}\.\d{3}Z)?$/;
  return dateString.match(regEx) != null;
}

export function statusColor(status) {
  switch (status) {
    case "ACTIVE":
      return "cyan";
    case "COMPLETED":
      return "purple";
    case "CANCELLED":
      return "red";
    default:
      return "grey";
  }
}

export function generateWeeks() {
  const today = new Date();
  const weeksArray = [];

  for (let i = 1; i <= 10; i++) {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 7 * i + 1);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 7 * (i - 1));

    const weekLabel = `Week ${i}`;
    weeksArray.push({
      label: weekLabel,
      value: `${format(new Date(startDate), "yyyy-MM-dd")}..${format(new Date(endDate), "yyyy-MM-dd")}`,
    });
  }

  return weeksArray;
}

export const evaluateShowIf = (str, formValues) => {
  if (!str) return true;
  const [fieldId, operator, value] = str.split(":");
  const fieldValue = formValues[fieldId]?.toString()?.toLowerCase();
  const valueArray = value?.split(",").map((item) => item?.toLowerCase());

  switch (operator) {
    case "eq":
      return fieldValue === value;
    case "ne":
      return fieldValue !== value;
    case "gt":
      return fieldValue > value;
    case "ge":
      return fieldValue >= value;
    case "lt":
      return fieldValue < value;
    case "le":
      return fieldValue <= value;
    case "like":
      return fieldValue?.includes(value);
    case "notin":
      return !valueArray?.includes(fieldValue);
    case "null":
      return !fieldValue;
    case "notnull":
      return fieldValue;
    default:
      return false;
  }
};

export const disableMicrobiology = (form, events) => {
  const dataElements = form?.sections?.flatMap((section) => {
    return section?.dataElements?.map((dataElement) => ({
      id: dataElement.id,
      name: dataElement.name,
    }));
  });

  // find the id for "Samples sent for culture"
  const samplesSentForCultureId = dataElements?.find((dataElement) => dataElement.name.includes("Samples sent for culture"))?.id;

  const samplesSentForCultureValues = events
    ?.flatMap((event) => {
      const value = event?.dataValues?.find((dataValue) => dataValue?.dataElement === samplesSentForCultureId)?.value;
      return value ? JSON.parse(value) : null;
    })
    ?.filter((value) => value);

  return samplesSentForCultureValues?.length;
};

export const evaluateValidations = (validations, fieldType, formValues, dataElements) => {
  if (!validations) return [];

  const createPromise = (bool, message) => new Promise((resolve, reject) => (bool ? resolve() : reject(message)));

  return (validations.replace(/\s/g, "").split(",") || []).map((validation) => {
    const [operator, fieldId] = validation.split(":");
    let fieldValue = formValues[fieldId]?.toString()?.toLowerCase() || "";

    const field = dataElements.find((dataElement) => dataElement?.id === fieldId) || {};

    if (fieldType === "DATE") {
      if (fieldId === "today") {
        field.name = fieldId;
        fieldValue = ["lt", "le", "eq", "gt"].includes(operator)
          ? new Date(new Date().setHours(23, 59, 59, 999))
          : new Date(new Date().setHours(0, 0, 0, 0));
      } else {
        fieldValue = formValues[fieldId] ? new Date(format(new Date(formValues[fieldId]), "yyyy-MM-dd")) : new Date();
      }
    }

    const formatDateValue = (value) => {
      if (operator === "eq" && fieldType === "DATE") {
        return value ? format(new Date(value), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
      }
      return value;
    };

    const operators = {
      eq: (value) =>
        createPromise(formatDateValue(fieldValue) === formatDateValue(value), `Value should be equal to ${field?.name}`),
      ne: (value) => createPromise(fieldValue !== value, `Value should not be equal to ${field?.name}`),
      gt: (value) => createPromise(value > fieldValue, `Value should be greater than ${field?.name}`),
      ge: (value) => createPromise(value >= fieldValue, `Value should be greater than or equal to ${field?.name}`),
      lt: (value) => createPromise(value < fieldValue, `Value should be less than ${field?.name}`),
      le: (value) => createPromise(value <= fieldValue, `Value should be less than or equal to ${field?.name}`),
      like: (value) => createPromise(fieldValue?.includes(value), `Value should contain ${fieldValue}`),
      notin: (value) => createPromise(!fieldValue?.includes(value), `Value should not be in ${fieldValue}`),
      null: (value) => createPromise(!value, `${field?.name} should be null`),
      notnull: (value) => createPromise(value, `${field?.name} should not be null`),
      default: () => createPromise(false, "Invalid operator"),
    };

    return {
      validator: (rule, value) => operators[operator]?.(value) || operators.default(),
    };
  });
};
