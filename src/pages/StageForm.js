import React, { useEffect, useState } from "react";
import { Breadcrumb, Spin, Card } from "antd";
import { Link, useLocation, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import useInstances from "../hooks/useInstances";
import useCompleteEvent from "../hooks/useEvents";
import { createUseStyles } from "react-jss";
import CardItem from "../components/CardItem";
import { CircularLoader } from "@dhis2/ui";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import Stage from "../components/Stage";
import { DoubleLeftOutlined } from "@ant-design/icons";
import Alert from "../components/Alert";
import UseDataStore from "../hooks/useDataStore";
import { formatForm } from "../lib/formFormatter";
import { setAttributes } from "../redux/actions";

dayjs.extend(weekday);
dayjs.extend(localeData);

const useStyles = createUseStyles({
  "@global": {
    ".ant-card": {
      backgroundColor: "#fafbfc",
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  form: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    "& > div": {
      width: "48%",
    },
  },
  backButton: {
    marginBottom: "1rem",
  },
  stage: {
    marginBottom: "1rem",
    borderRadius: "5px",
  },
});

export default function StageForm() {
  const [dataValues, setDataValues] = useState(null);
  const [loading, _setLoading] = useState(false);
  const [success, _setSuccess] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [stageEvents, setStageEvents] = useState([]);

  const { stages } = useSelector((state) => state.forms);

  const location = useLocation();

  const { activateAllEvents } = useCompleteEvent();

  const parseQueryString = () => {
    const queryString = location.search.substring(1);
    const params = queryString.split("&");
    const paramObject = {};

    params.forEach((param) => {
      const [key, value] = param.split("=");
      paramObject[key] = value;
    });

    return paramObject;
  };

  const queryParams = parseQueryString();

  const classes = useStyles();

  const { getData } = UseDataStore();

  const dispatch = useDispatch();

  const { stage, enrollment, trackedEntityInstance } = useParams();

  const surgeryLink = `/surgery/${trackedEntityInstance}/${enrollment}`;

  const { getEnrollmentData } = useInstances();

  const stageForm = stages?.find((item) => item.stageId === stage);

  const getEnrollment = async () => {
    const data = await getEnrollmentData();

    if (data?.status) {
      const attributes = data?.attributes?.map((attribute) => ({
        id: attribute.attribute,
        name: attribute?.displayName,
        valueType: attribute?.valueType,
        value: attribute?.value,
      }));

      dispatch(setAttributes(attributes));
      setEnrollmentData(data);
      const stageValues = await filterAndSortEvents(data.events);
      setStageEvents(stageValues);
      if (stageValues?.length > 0 && stageForm) {
        const dataForm = formatForm(stageForm, stageValues);
        setDataValues(dataForm);
      }
    }
  };

  const filterAndSortEvents = async (events) => {
    const mappings = await getData("repeatSections", "postOperative");
    const repeatIds = [...new Set(stageForm?.sections?.map((section) => section?.stage?.stageId))];

    const filteredEvents = events?.filter((event) => {
      if (queryParams.event) {
        const repeatEvents = mappings
          .filter((mapping) => mapping.parentEvent === queryParams.event)
          .map((mapping) => mapping.event);
        return event.event === queryParams.event || repeatEvents.includes(event.event);
      }
      return event.programStage === stage || repeatIds?.includes(event.programStage);
    });

    if (filteredEvents) {
      return filteredEvents.sort((a, b) => a.created - b.created);
    }
    return [];
  };

  useEffect(() => {
    if (stageForm) {
      getEnrollment();
    }
  }, [stageForm]);

  return (
    <div>
      <Breadcrumb
        separator={<DoubleLeftOutlined />}
        style={{ marginBottom: "1rem" }}
        items={[
          {
            title: <Link to="/surgeries">Surgeries</Link>,
          },
          {
            title: <Link to={surgeryLink}>Surgery Details</Link>,
          },
          {
            title: stageForm?.title,
          },
        ]}
      />
      <Card title={stageForm?.title} size="small">
        <Spin spinning={!dataValues || !stageForm}>
          <div className={classes.stage}>
            {dataValues && stageForm && (
              <Stage
                getEnrollment={getEnrollment}
                enrollmentData={enrollmentData}
                dataValues={dataValues}
                surgeryLink={surgeryLink}
                setDataValues={setDataValues}
                eventId={queryParams.event}
                stageForm={stageForm}
                stageEvents={stageEvents}
              />
            )}
          </div>
        </Spin>

        {success && <Alert success>{success}</Alert>}
      </Card>
    </div>
  );
}
