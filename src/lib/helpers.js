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
  const attributeValues = attributes.map((attributeValue) => {
    return {
      name: attributeValue.attribute.name,
      value: attributeValue.value,
    };
  });

  return attributeValues.reduce((acc, attributeValue) => {
    acc[attributeValue.name?.toLowerCase()] = attributeValue.value;
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
  const mainStages = allStages.filter((stage) => !stage?.parentstage);
  //   combine all stages with their children: children have the parentstage id under the parentstage key
  const stages = mainStages.map((stage) => {
    const children = allStages.filter((child) => child?.parentstage === stage?.id);
    return { ...stage, children };
  });

  const formatStage = (stage) => {
    return {
      title: stage.name,
      description: stage.description,
      stageId: stage.id,
      repeatable: stage.repeatable,
      sections: stage.programStageSections.map((section) => {
        return {
          name: section.displayName,
          description: section.description,
          sectionId: section.id,
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
    weeksArray.push({ label: weekLabel, value: `${format(new Date(startDate), "yyyy-MM-dd")}..${format(new Date(endDate), "yyyy-MM-dd")}` });
  }

  return weeksArray;
}