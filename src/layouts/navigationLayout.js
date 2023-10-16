import React, { useEffect } from "react";
import {
  HomeOutlined as HomeIcon,
  PieChartOutlined as ChartPieIcon,
  ArrowDownOutlined as ArrowDownRightIcon,
  SettingOutlined as Cog6ToothIcon,
} from "@ant-design/icons";
import { Menu } from "antd";
import { createUseStyles } from "react-jss";
import { Routes, Route, useNavigate } from "react-router-dom";
import routes from "../routes";
import UseGetForms from "../hooks/useGetForms";
import UseGetOrgUnit from "../hooks/useGetOrgUnit";
import { useSelector } from "react-redux";

const styles = createUseStyles({
  "@global": {
    ".ant-menu": {
      minHeight: "calc(100vh - 48px) !important",
      position: "fixed",
    },
    ".ant-menu-item": {
      borderBottom: "1px solid #f0f0f0",
      width: "100% !important",
      marginBlock: "0px !important",
      padding: "24px !important",
      "&:hover": {
        backgroundColor: "#E3EEF7 !important",
        borderRadius: "0px !important",
      },
    },
  },
  content: {
    padding: "24px",
    marginLeft: "256px",
    overflow: "auto",
    backgroundColor: "#FAFAFA",
    minHeight: "calc(100vh - 48px)",
  },
});

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}
const items = [
  getItem("Dashboard", "/", <HomeIcon />, null, "item"),
  getItem("Surgeries", "/surgeries", <ChartPieIcon />, null, "item"),

  getItem("Reports", "/reports", <ArrowDownRightIcon />, null, "item"),
  getItem("Configurations", "/configurations", <Cog6ToothIcon />, null, "item"),
];
const NavigationLayout = ({ user, program, organisationUnits }) => {
  const classes = styles();

  const forms = useSelector((state) => state.forms);

  const orgUnit = useSelector((state) => state.orgUnit);

  const { getForms } = UseGetForms();

  const { getOrgUnit } = UseGetOrgUnit();

  const navigate = useNavigate();

  const onClick = (e) => {
    navigate(e.key);
  };

  useEffect(() => {
    if (
      !Object.keys(forms)?.length > 0 &&
      !Object.keys(forms)?.includes("registration")
    ) {
      getForms();
    }

    if (!orgUnit?.id) {
      getOrgUnit();
    }
  }, [forms, orgUnit]);

  return (
    <div className={classes.root}>
      <Menu
        onClick={onClick}
        style={{
          width: 256,
        }}
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["/"]}
        mode="inline"
        items={items}
      />
      <div className={classes.content}>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <route.component
                  program={program}
                  user={user}
                  organisationUnits={organisationUnits}
                />
              }
            />
          ))}
        </Routes>
      </div>
    </div>
  );
};
export default NavigationLayout;
