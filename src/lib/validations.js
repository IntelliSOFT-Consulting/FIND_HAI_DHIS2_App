export const evaluateRiskFactors = (isRiskFactors, attributes) => {
  if (isRiskFactors) {
    const age = attributes.find((attribute) => attribute.name === "Age");

    return [
      {
        validator: (_, value) => {
          if (age?.value >= 75 && !value.includes("Age > 75 yrs")) {
            return Promise.reject("This patient is over 75 years old. Please select 'Age > 75 yrs'.");
          }
          // if value has "Healthy person" Don't allow any other values
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
