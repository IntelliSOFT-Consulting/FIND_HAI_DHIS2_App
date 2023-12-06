import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { formsReducer, programValuesReducer, searchFieldsReducer, orgUnitReducer, userReducer } from "./reducer";

const searchFields = localStorage.getItem("searchFields") ? JSON.parse(localStorage.getItem("searchFields")) : null;

const initialState = {
  searchFields: searchFields,
};

const reducer = combineReducers({
  forms: formsReducer,
  programValues: programValuesReducer,
  searchFields: searchFieldsReducer,
  orgUnit: orgUnitReducer,
  user: userReducer,
});

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, initialState, composeEnhancer(applyMiddleware(thunk)));
export default store;
