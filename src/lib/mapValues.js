export const formatValues = (form, dataValues) => {
  const dataElements = form?.sections?.map((section) => {
    if (form.enrollment) {
      return {
        ...section,
        dataElements: section?.dataElements?.map((dataElement) => {
          const dataValue = dataValues?.attributes?.find((attribute) => attribute.attribute === dataElement.id);
          return {
            id: dataElement.id,
            name: dataElement.name,
            valueType: dataElement.valueType,
            compulsory: dataElement.compulsory,
            optionSet: dataElement.optionSet,
            value: dataValue?.value,
          };
        }),
      };
    }
    return {
      ...section,
      dataElements: section?.dataElements?.map((dataElement) => {
        const dataValue = dataValues?.dataValues?.find((dataValue) => dataValue.dataElement === dataElement.id);
        return {
          id: dataElement.id,
          name: dataElement.name,
          valueType: dataElement.valueType,
          required: dataElement.compulsory,
          optionSet: dataElement.optionSet,
          value: dataValue?.value,
        };
      }),
    };
  });

  return dataElements;
};
