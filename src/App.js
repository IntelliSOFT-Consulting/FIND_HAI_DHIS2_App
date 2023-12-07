import React from "react";
import { DataQuery } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import NavigationLayout from "./layouts/navigationLayout";
import Home from "./pages/Home";
import { Routes, Route, HashRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import store from "./redux/store";
import './style.css';

const defaultData = {
  borderRadius: 6,
  colorPrimary: "#2C6693",
  Button: {
    colorPrimary: "#2C6693 !important",
    algorithm: "normal",
  },
};

const query = {
  me: {
    resource: "me",
    params: {
      fields: "id,displayName,userRoles[id,displayName],organisationUnits[id,displayName],programs[id,displayName]",
    },
  },
  programs: {
    resource: "programs",
    params: {
      fields: "id,name",
      filter: "name:ilike:find",
    },
  },
  // get the last organization unit step
  organisationUnits: {
    resource: "organisationUnits",
    params: {
      fields: "id,name",
      filter: "level:ge:5",
    },
  },
};

const MyApp = () => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: defaultData.colorPrimary,
        borderRadius: defaultData.borderRadius,
      },
      components: {
        Button: {
          colorPrimary: defaultData.Button?.colorPrimary,
          algorithm: defaultData.Button?.algorithm,
        },
      },
    }}
    button={{
      style: {
        boxShadow: "none",
      },
    }}
    input={{
      style: {
        "&:hover": {
          boxShadow: "0 0 0 2px #2C6693 !important",
        },
      },
    }}
  >
    <Provider store={store}>
      <HashRouter>
        <div>
          <DataQuery query={query}>
            {({ error, loading, data }) => {
              if (error) return <span>ERROR</span>;
              if (loading) return <span>...</span>;
              return (
                <Routes>
                  <Route
                    path="/*"
                    element={
                      <NavigationLayout
                        program={data?.programs?.programs[0]}
                        user={data?.me}
                        title={i18n.t("FIND")}
                        organisationUnits={data?.organisationUnits?.organisationUnits[0]}
                      />
                    }
                  />
                  <Route
                    path="/"
                    element={<Home program={data?.programs?.programs[0]} user={data?.me} title={i18n.t("FIND")} />}
                  />
                </Routes>
              );
            }}
          </DataQuery>
        </div>
      </HashRouter>
    </Provider>
  </ConfigProvider>
);

export default MyApp;
