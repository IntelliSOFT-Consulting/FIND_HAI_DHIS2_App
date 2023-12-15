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

export const setUser = (user) => (dispatch) => {
    dispatch({
        type: "USER",
        payload: user,
    });
};

export const setAttributes = (attributes) => (dispatch) => {
  dispatch({
    type: "ATTRIBUTES",
    payload: attributes,
  });
}

export const setDataElements = (dataElements) => (dispatch) => {
  dispatch({
    type: "DATA_ELEMENTS",
    payload: dataElements,
  });
}
