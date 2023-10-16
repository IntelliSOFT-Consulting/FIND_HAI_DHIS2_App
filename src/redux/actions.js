export const setProgramValues = (values) => (dispatch) => {
  dispatch({
    type: "PROGRAM_VALUES",
    payload: values,
  });
};

export const setForms = (forms) => (dispatch) => {
  dispatch({
    type: "FORMS",
    payload: forms,
  });
};

export const setSearchFields = (fields) => (dispatch) => {
  dispatch({
    type: "SEARCH_FIELDS",
    payload: fields,
  });
};

export const setOrgUnit = (orgUnit) => (dispatch) => {
  dispatch({
    type: "ORG_UNIT",
    payload: orgUnit,
  });
};