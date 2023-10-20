(rule, value) => {
  const fieldValue = form.getFieldValue("dtgA3a71Htu");
  if (dataElement?.id === "Ogx5pUkCK7Y" && value && fieldValue) {
    const dateOfAdmission = dayjs(fieldValue);
    const dateOfSurgery = dayjs(value);
    if (dateOfSurgery.isBefore(dateOfAdmission)) {
      return Promise.reject(
        "Date of surgery should not be earlier than date of admission"
      );
    }
  }
  return Promise.resolve();
};

/*

(rule, value) => {
    const fieldValue = form.getFieldValue("dtgA3a71Htu");
  if (dataElement?.id === "Ogx5pUkCK7Y" && value && fieldValue ) {
    const dateOfAdmission = dayjs(fieldValue);
    const dateOfSurgery = dayjs(value);
    if (dateOfSurgery.isBefore(dateOfAdmission)) {
      return Promise.reject(
        "Date of surgery should not be earlier than date of admission"
      );
    }
  }
  return Promise.resolve();
};

*/
