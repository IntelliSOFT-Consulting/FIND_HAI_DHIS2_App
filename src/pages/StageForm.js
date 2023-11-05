import React, { useEffect, useState } from "react";
import { Button, Spin } from "antd";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import UseGetEnrollmentsData from "../hooks/UseGetEnrollmentsData";
import { isValidDate } from "../lib/helpers";
import { createUseStyles } from "react-jss";
import CardItem from "../components/CardItem";
import UseSaveValue from "../hooks/useSaveValue";
import UseGetEvent from "../hooks/useGetEvent";
import UseCompleteEvent from "../hooks/useCompleteEvent";
import { CircularLoader } from "@dhis2/ui";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import Stage from "../components/Stage";
import { DoubleLeftOutlined } from "@ant-design/icons";
import UseCreateEvent from "../hooks/useCreateEvent";
import { useDataEngine } from "@dhis2/app-runtime";
import Alert from "../components/Alert";
import UseDataStore from "../hooks/useDataStore";

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
  const [events, setEvents] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const { stages, program } = useSelector((state) => state.forms);
  const { id } = useSelector((state) => state.orgUnit);

  const classes = useStyles();
  const navigate = useNavigate();

  const { createEvent } = UseCreateEvent();
  const { getData, saveData } = UseDataStore();

  const { stage, enrollment, trackedEntityInstance } = useParams();

  const surgeryLink = `/surgery/${trackedEntityInstance}/${enrollment}`;

  const { saveValue } = UseSaveValue();
  const { completeEvent } = UseCompleteEvent();
  const { getEnrollmentData } = UseGetEnrollmentsData();

  const stageForm = stages?.find((item) => item.id === stage);

  const getEnrollment = async () => {
    const data = await getEnrollmentData();
    setEnrollmentData(data);

    const stageValues = data?.events?.filter((event) => event.programStage === stage)?.sort((a, b) => a.created - b.created);

    setEvents(stageValues);
    console.log("stageValues: ", stageValues);

    if (data?.status) {
      let eventForms = stageValues?.map((event) => {
        const stageEvent = {
          ...event,
          ...event?.dataValues?.reduce((acc, curr) => {
            acc[curr.dataElement] = curr.value;
            return acc;
          }, {}),
        };

        return stageEvent;
      });

      const mappedValues = stageForm?.sections?.map((section) => {
        if (section?.repeating) {
          const sectionIds = section.dataElements.map((item) => item.id);
          const values = eventForms?.map((event) => {
            return sectionIds?.reduce((acc, curr) => {
              acc[curr] = event?.[curr];
              return acc;
            }, {});
          });

          return {
            [section.sectionId]: values,
          };
        }
        return section?.dataElements?.reduce((acc, dataElement) => {
          const value =
            eventForms?.find((item) => item?.[dataElement?.id] !== null && item?.[dataElement?.id] !== undefined)?.[
              dataElement?.id
            ] || null;

          acc[dataElement?.id] = isValidDate(value)
            ? dayjs(value, dateFormat)
            : value === "true"
            ? true
            : value === "false"
            ? false
            : value;
          return acc;
        }, {});
      });

      const initialValues = mappedValues?.reduce((acc, curr) => {
        acc = { ...acc, ...curr };
        return acc;
      }, {});

      setFormValues(initialValues);
    }
  };

  const handleChange = async (value) => {
    const valueKey = Object.keys(value)[0];
    const valueObject = value[valueKey];
    if (Array.isArray(valueObject)) {
      return;
    }

    await saveValue(events[0]?.event, valueObject, valueKey, id, program, stage);
  };

  const handleFinish = async (values, event) => {
    setLoading(true);
    const formListFields = Object.keys(values).filter((key) => Array.isArray(values[key]));

    const dataValues = Object.keys(values).map((key) => ({
      dataElement: key,
      value: values[key],
    }));

    const payload = dataValues.filter((item) => !formListFields.includes(item.dataElement));

    if (formListFields.length > 0) {
      let draft = [];
      let listvalues = formListFields.map((field, index) => {
        const eventValues = values[field].map((value, i) => {
          const eventId = events[i]?.event;
          const dataValues = Object.keys(value).map((key) => ({
            event: eventId,
            dataElement: key,
            value: value[key],
          }));
          if (eventId) {
            const filteredValues = events[i]?.dataValues?.filter(
              (item) => !dataValues.some((value) => value.dataElement === item.dataElement)
            );

            dataValues.unshift(...filteredValues);
          }
          draft[i] = [...(draft[i] || []), ...dataValues];

          return dataValues;
        });

        return eventValues;
      });

      const saveValues = await Promise.all(
        draft.map(async (item, i) => {
          if (events[i]) {
            const response = await completeEvent(events[i]?.event, id, program, stage, item, "ACTIVE");

            return response;
          } else {
            const mappings = await getData("repeatSections", "postOperative");

            const response = await createEvent(stage, item);
            if (response) {
              const newMapping = {
                parentEvent: events[0]?.event,
                event: response,
              };
              mappings.push(newMapping);

              const mappedResponse = await saveData("repeatSections", "postOperative", mappings);
              return mappedResponse;
            }
            return response;
          }
        })
      );

      if (saveValues) {
        getEnrollment();
        setLoading(false);
        setSuccess("Event saved successfully");
        const timeout = setTimeout(() => {
          setSuccess(null);
        }, 2000);

        () => clearTimeout(timeout);

        navigate(surgeryLink);
      }
    }
  };

  useEffect(() => {
    getEnrollment();
  }, [stageForm]);

  return (
    <div>
      <Link to={surgeryLink}>
        <Button icon={<DoubleLeftOutlined />} className={classes.backButton} size="small">
          Back to Surgery Overview
        </Button>
      </Link>
      <CardItem title={stageForm?.title}>
        {!formValues ? (
          <CircularLoader />
        ) : (
          <Spin spinning={loading}>
            <div className={classes.stage}>
              <Stage
                stageForm={stageForm}
                handleChange={handleChange}
                handleFinish={handleFinish}
                formValues={formValues}
                repeatable={stageForm?.repeatable && stageForm?.repeattype !== "section"}
              />
            </div>
          </Spin>
        )}
        {success && <Alert success>{success}</Alert>}
      </CardItem>
    </div>
  );
}
