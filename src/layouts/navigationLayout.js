import React, { useEffect } from "react";
import {
  HomeOutlined as HomeIcon,
  PieChartOutlined as ChartPieIcon,
  ArrowDownOutlined as ArrowDownRightIcon,
  SettingOutlined as Cog6ToothIcon,
} from "@ant-design/icons";
import { Menu, Layout } from "antd";
import { createUseStyles } from "react-jss";
import { Routes, Route, useNavigate } from "react-router-dom";
import routes from "../routes";
import UseGetForms from "../hooks/useGetForms";
import UseGetOrgUnit from "../hooks/useGetOrgUnit";
import { useSelector } from "react-redux";

const { Content, Sider } = Layout;

const styles = createUseStyles({
  "@global": {
    ".ant-layout-sider": {
      position: "fixed",
      background: "white !important",
    },
    ".ant-layout-sider-zero-width-trigger": {
      background: "#2C6693 !important",
      top: "74px !important",
    },
    ".ant-menu-item": {
      borderBottom: "1px solid #f0f0f0",
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
    overflow: "auto",
    backgroundColor: "#FAFAFA",
    minHeight: "calc(100vh - 48px)",
    width: "100%",
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
    if (!Object.keys(forms)?.length > 0 && !Object.keys(forms)?.includes("registration")) {
      getForms();
    }

    if (!orgUnit?.id) {
      getOrgUnit();
    }
  }, [forms, orgUnit]);

  return (
    <Layout>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
      >
        <Menu onClick={onClick} defaultSelectedKeys={["1"]} defaultOpenKeys={["/"]} mode="inline" items={items} />
      </Sider>

      <Content className={classes.content}>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<route.component program={program} user={user} organisationUnits={organisationUnits} />}
            />
          ))}
        </Routes>
      </Content>
    </Layout>
  );
};
export default NavigationLayout;
