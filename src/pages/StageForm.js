import React, { useEffect, useState } from "react";
import { Table, Button, Form, Tooltip } from "antd";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import UseGetEnrollmentsData from "../hooks/UseGetEnrollmentsData";
import { isValidDate } from "../lib/helpers";
import Section from "../components/Section";
import { createUseStyles } from "react-jss";
import CardItem from "../components/CardItem";
import InputItem from "../components/InputItem";
import UseSaveValue from "../hooks/useSaveValue";
import UseGetEvent from "../hooks/useGetEvent";
import UseCompleteEvent from "../hooks/useCompleteEvent";
import { CircularLoader } from "@dhis2/ui";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import Stage from "../components/Stage";
import { DoubleLeftOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";
import UseCreateEvent from "../hooks/useCreateEvent";
import { useDataEngine } from "@dhis2/app-runtime";

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
  const [status, setStatus] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState(null);

  const { stages, trackedEntity, program } = useSelector(
    (state) => state.forms
  );
  const { id } = useSelector((state) => state.orgUnit);

  const classes = useStyles();
  const navigate = useNavigate();
  const engine = useDataEngine();

  const { createEvent } = UseCreateEvent();

  const { stage, enrollment, trackedEntityInstance } = useParams();

  const surgeryLink = `/surgery/${trackedEntityInstance}/${enrollment}`;

  const { saveValue } = UseSaveValue();
  const { getEvent } = UseGetEvent();
  const { completeEvent } = UseCompleteEvent();
  const { getEnrollmentData } = UseGetEnrollmentsData();

  const stageForm = stages?.find((item) => item.id === stage);

  const getEnrollment = async () => {
    const data = await getEnrollmentData(trackedEntityInstance, enrollment);
    setEnrollmentData(data);

    const stageValues = data?.events
      ?.filter((event) => event.programStage === stage)
      ?.sort((a, b) => a.created - b.created);

    if (data?.status) {
      const eventForms = stageValues?.map((event) => {
        const stageEvent = {
          ...event,
          ...event?.dataValues?.reduce((acc, curr) => {
            acc[curr.dataElement] = curr.value;
            return acc;
          }, {}),
        };

        return stageForm?.sections?.map((section) => {
          return {
            ...section,
            status: stageEvent?.status,
            dataElements: section?.dataElements?.map((dataElement) => {
              return {
                ...dataElement,
                value: isValidDate(stageEvent?.[dataElement.id])
                  ? dayjs(stageEvent?.[dataElement.id], dateFormat)
                  : stageEvent?.[dataElement.id],
                event: stageEvent?.event,
              };
            }),
          };
        });
      });
      setFormValues(eventForms);
    }
  };

  const handleChange = async (value, event) => {
    const valueKey = Object.keys(value)[0];
    const valueObject = value[valueKey];
    await saveValue(event, valueObject, valueKey, id, program, stage);
  };

  const handleFinish = async (values, event) => {
    const dataValues = Object.keys(values).map((key) => ({
      dataElement: key,
      value: values[key],
    }));
    const newStatus = status === "COMPLETED" ? "ACTIVE" : "COMPLETED";
    const result = await completeEvent(
      event,
      id,
      program,
      stage,
      dataValues,
      newStatus
    );
    if (result) {
      setStatus((prev) => (prev === "COMPLETED" ? "ACTIVE" : "COMPLETED"));
      getEnrollment();
      // navigate(surgeryLink);
    }
  };

  const isAddStageActive = (stage) => {
    const events = formValues?.filter((event) => {
      return event?.[0]?.status === "COMPLETED";
    });
    // console.log("stage: ", stageForm);
    // console.log("Events: ", events);
    return (
      stage?.repeatable &&
      stage?.repeattype &&
      stage?.repeattype === "section" &&
      events?.length > 0
    );
  };

  const addEvent = async () => {
    const eventData = {
      program,
      programStage: stage,
      trackedEntityInstance,
      enrollment,
      orgUnit: id,
      status: "ACTIVE",
      eventDate: moment().format("YYYY-MM-DD"),
      dataValues: [],
    };
    const event = await createEvent({ events: [eventData] });
    if (event) {
      getEnrollment();
    }
  };

  useEffect(() => {
    getEnrollment();
  }, [stageForm]);

  console.log("formValues", formValues);

  return (
    <div>
      <Link to={surgeryLink}>
        <Button
          icon={<DoubleLeftOutlined />}
          className={classes.backButton}
          size="small"
        >
          Back to Surgery Overview
        </Button>
      </Link>
      <CardItem title={stageForm?.title}>
        {!formValues ? (
          <CircularLoader />
        ) : (
          formValues?.map((event, index) => (
            <div className={classes.stage}>
              <Stage
                key={index}
                index={index}
                stageForm={event}
                handleChange={handleChange}
                handleFinish={handleFinish}
                formValues={event}
              />
            </div>
          ))
        )}
        {
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {stageForm?.repeatable && (
              <Button
                block
                icon={<PlusOutlined />}
                disabled={!isAddStageActive(stageForm)}
                type="dashed"
                onClick={addEvent}
              >
                Add section
              </Button>
            )}
          </div>
        }
      </CardItem>
    </div>
  );
}
