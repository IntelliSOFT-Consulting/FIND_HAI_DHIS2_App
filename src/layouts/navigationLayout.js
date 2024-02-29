import React, { useEffect } from "react";
import {
  HomeOutlined as HomeIcon,
  PieChartOutlined as ChartPieIcon,
  ArrowDownOutlined as ArrowDownRightIcon,
  SettingOutlined as Cog6ToothIcon,
} from "@ant-design/icons";
import { Menu, Layout } from "antd";
import { createUseStyles } from "react-jss";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import routes from "../routes";
import UseGetForms from "../hooks/useGetForms";
import UseOrgUnit from "../hooks/useOrgUnit";
import useDataElements from "../hooks/useDataElements";
import { setUser, setDataElements } from "../redux/actions";
import { useSelector, useDispatch } from "react-redux";

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
    // backgroundColor: "#FAFAFA",
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

const domain = window.location.origin;
const items = [
  getItem("Dashboard", "/", <HomeIcon />, null, "item"),
  getItem("Surgeries", "/surgeries", <ChartPieIcon />, null, "item"),
  getItem(<a href={`${domain}`}>Reports</a>, null, <ArrowDownRightIcon />, null, "item"),
  getItem(
    <a href={`${domain}/dhis-web-maintenance/index.html#/list/programSection/program`}>Configurations</a>,
    null,
    <Cog6ToothIcon />,
    null,
    "item"
  ),
];
const NavigationLayout = ({ user, program, organisationUnits }) => {
  const classes = styles();

  const dispatch = useDispatch();

  const forms = useSelector((state) => state.forms);

  const orgUnit = useSelector((state) => state.orgUnit);
  const currentUser = useSelector((state) => state.user);
  const dataElements = useSelector((state) => state.dataElements);

  const { getForms } = UseGetForms();

  const { getOrgUnit } = UseOrgUnit();

  const { getDataElements } = useDataElements();

  const navigate = useNavigate();

  const location = useLocation();

  const fetchElements = async () => {
    if (!dataElements?.length > 0) {
      const elem = await getDataElements();
      dispatch(setDataElements(elem));
    }
  };

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

    if (!currentUser?.id) {
      dispatch(setUser(user));
    }

    fetchElements();
  }, [forms, orgUnit, user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Layout>
      <Sider breakpoint="lg" collapsedWidth="0">
        <Menu onClick={onClick} defaultSelectedKeys={["1"]} defaultOpenKeys={["/"]} mode="inline" items={items} />
      </Sider>

      <Content className={`${classes.content} bg-blue-light`}>
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
