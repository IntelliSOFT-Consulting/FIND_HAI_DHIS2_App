import React from "react";
import { DataQuery } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import NavigationLayout from "./layouts/navigationLayout";
import Home from "./pages/Home";
import { Routes, Route, HashRouter } from "react-router-dom";
import { ConfigProvider } from "antd";

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
    <HashRouter>
      <div>
        <DataQuery query={query}>
          {({ error, loading, data }) => {
            if (error) return <span>ERROR</span>;
            if (loading) return <span>...</span>;
            return (
              <Routes>
                <Route path="/*" element={<NavigationLayout />} />
                <Route path="/" element={<Home />} />
              </Routes>
            );
          }}
        </DataQuery>
      </div>
    </HashRouter>
  </ConfigProvider>
);

export default MyApp;
