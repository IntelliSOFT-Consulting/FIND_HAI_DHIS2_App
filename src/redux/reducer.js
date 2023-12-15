export const programValuesReducer = (state = [], action) => {
  switch (action.type) {
    case "PROGRAM_VALUES":
      return action.payload;

    default:
      return state;
  }
};

export const formsReducer = (state = {}, action) => {
  switch (action.type) {
    case "FORMS":
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};

export const searchFieldsReducer = (state = [], action) => {
  switch (action.type) {
    case "SEARCH_FIELDS":
      return action.payload;

    default:
      return state;
  }
};

export const orgUnitReducer = (state = {}, action) => {
  switch (action.type) {
    case "ORG_UNIT":
      return action.payload;

    default:
      return state;
  }
};

export const userReducer = (state = {}, action) => {
  switch (action.type) {
    case "USER":
      return action.payload;

    default:
      return state;
  }
};

export const attributesReducer = (state = [], action) => {
  switch (action.type) {
    case "ATTRIBUTES":
      return action.payload;

    default:
      return state;
  }
};

export const dataElementsReducer = (state = [], action) => {
  switch (action.type) {
    case "DATA_ELEMENTS":
      return action.payload;

    default:
      return state;
  }
};