export const evaluateRiskFactors = (isRiskFactors, attributes) => {
  if (isRiskFactors) {
    const age = attributes.find((attribute) => attribute.name === "Age");

    return [
      {
        validator: (_, value) => {
          if (age?.value >= 75 && !value.includes("Age > 75 yrs")) {
            return Promise.reject("This patient is over 75 years old. Please select 'Age > 75 yrs'.");
          }
          if (value.includes("Healthy person") && value.length > 1) {
            return Promise.reject("Healthy person cannot have any other risk factors.");
          }
          return Promise.resolve();
        },
      },
    ];
  }
  return [];
};

export const disableDuplicateProphylaxis = (field) => {
  if (field?.name === "Postoperative Antibiotic Prophylaxis") {
    return [
      ({ getFieldsValue }) => ({
        validator(_, value) {
          const allValues = getFieldsValue();
          const section = Object.keys(allValues);
          const valuesArray = allValues[section[0]]?.map((item) => item[field.id])?.filter((item) => item !== undefined);

          if (valuesArray?.filter((item) => item === value).length > 1) {
            return Promise.reject("This prophylaxis has already been selected.");
          }
          return Promise.resolve();
        },
      }),
    ];
  }
  return [];
};
