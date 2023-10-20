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

  const attributeValuesObject = attributeValues.reduce(
    (acc, attributeValue) => {
      acc[attributeValue.name?.toLowerCase()] = attributeValue.value;
      return acc;
    },
    {}
  );
  return attributeValuesObject;
};

export function formatRegistration(program) {
  return {
    title: "PATIENT DETAILS",
    enrollment: true,
    sections: program?.programSections?.map((section) => {
      return {
        title: section.name,
        dataElements: section.trackedEntityAttributes.map((attribute) => {
          return {
            name: attribute.name,
            id: attribute.id,
            valueType: attribute.valueType,
            // compulsory: !attribute.name?.includes("specify"),
            optionSet: attribute.optionSet,
            ...formatAttributeValues(attribute.attributeValues),
          };
        }),
      };
    }),
  };
}

export function formatSurgery(program) {
  return program?.programStages?.map((stage) => {
    return {
      title: stage.name,
      enrollment: false,
      id: stage.id,
      sections: stage.programStageSections.map((section) => {
        return {
          title: section.displayName,
          dataElements: section.dataElements.map((dataElement) => {
            return {
              name: dataElement.displayName,
              id: dataElement.id,
              valueType: dataElement.valueType,
              compulsory: dataElement.compulsory,
              optionSet: dataElement.optionSet,
              ...formatAttributeValues(dataElement.attributeValues),
            };
          }),
        };
      }),
    };
  });
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
    `${hour.toString().padStart(2, "0")}-${minute
      .toString()
      .padStart(2, "0")}-${second.toString().padStart(2, "0")}`;

  return haiYyMmDdHhMmSs;
}

export function isValidDate(dateString) {
  if (typeof dateString !== "string") return false;

  const regEx = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}\.\d{3}Z)?$/;
  return dateString.match(regEx) != null;
}
