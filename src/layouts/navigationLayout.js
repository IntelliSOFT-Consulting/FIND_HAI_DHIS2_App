import React from "react";
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
const NavigationLayout = () => {
  const classes = styles();

  const navigate = useNavigate();

  const onClick = (e) => {
    navigate(e.key);
  };
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
              element={<route.component />}
            />
          ))}
        </Routes>
      </div>
    </div>
  );
};
export default NavigationLayout;
