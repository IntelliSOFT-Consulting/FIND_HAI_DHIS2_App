import React, { useEffect, useState } from "react";
import { Breadcrumb, Spin } from "antd";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import UseGetEnrollmentsData from "../hooks/UseGetEnrollmentsData";
import { createUseStyles } from "react-jss";
import CardItem from "../components/CardItem";
import UseSaveValue from "../hooks/useSaveValue";
import UseCompleteEvent from "../hooks/useCompleteEvent";
import { CircularLoader } from "@dhis2/ui";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import Stage from "../components/Stage";
import { DoubleLeftOutlined } from "@ant-design/icons";
import UseCreateEvent from "../hooks/useCreateEvent";
import UseUpdateEnrollment from "../hooks/useUpdateEnrollment";
import Alert from "../components/Alert";
import UseDataStore from "../hooks/useDataStore";
import { formatForm } from "../lib/formFormatter";

dayjs.extend(weekday);
dayjs.extend(localeData);

const useStyles = createUseStyles({
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
    border: "1px solid rgba(0,0,0,0.5)",
    borderRadius: "5px",
  },
});

const dateFormat = "YYYY-MM-DD";

export default function StageForm() {
  const [formValues, setFormValues] = useState(null);
  const [forms, setForms] = useState(null);
  const [events, setEvents] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const { stages, program } = useSelector((state) => state.forms);
  const { id } = useSelector((state) => state.orgUnit);

  const location = useLocation();

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
  const navigate = useNavigate();

  const { createEvent } = UseCreateEvent();
  const { updateEnrollment } = UseUpdateEnrollment();
  const { getData, saveData } = UseDataStore();

  const { stage, enrollment, trackedEntityInstance } = useParams();

  const surgeryLink = `/surgery/${trackedEntityInstance}/${enrollment}`;

  const { saveValue } = UseSaveValue();
  const { completeEvent } = UseCompleteEvent();
  const { getEnrollmentData } = UseGetEnrollmentsData();

  const stageForm = stages?.find((item) => item.stageId === stage);

  const getEnrollment = async () => {
    const data = await getEnrollmentData();
    setEnrollmentData(data);

    if (data?.status) {
      const stageValues = await filterAndSortEvents(data.events);
      if (stageValues?.length > 0 && stageForm) {
        const dataForm = await formatForm(stageForm, stageValues);

        setForms(dataForm);
      }
    }
  };

  const filterAndSortEvents = async (events) => {
    const mappings = await getData("repeatSections", "postOperative");

    const repeatIds = stageForm?.children?.map((child) => child?.stageId);
    return events
      ?.filter((event) => {
        if (queryParams.event) {
          const repeatEvents = mappings
            .filter((mapping) => mapping?.parentEvent === queryParams.event)
            ?.map((mapping) => mapping?.event);
          return event.event === queryParams.event || repeatEvents?.includes(event.event);
        }
        return event.programStage === stage || repeatIds?.includes(event.programStage);
      })
      ?.sort((a, b) => a.created - b.created);
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
      <CardItem title={stageForm?.title}>
        {!forms ? (
          <CircularLoader />
        ) : (
          <Spin spinning={loading}>
            <div className={classes.stage}>
              <Stage forms={forms} surgeryLink={surgeryLink} setForms={setForms} />
            </div>
          </Spin>
        )}
        {success && <Alert success>{success}</Alert>}
      </CardItem>
    </div>
  );
}
