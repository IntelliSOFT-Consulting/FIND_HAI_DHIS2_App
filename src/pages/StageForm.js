import React, { useEffect, useState } from "react";
import { Button, Spin, Breadcrumb } from "antd";
import { Link, useParams, useNavigate } from "react-router-dom";
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
import { formatValue } from "../lib/mapValues";
import { createPayload } from "../lib/stages";

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
  const { updateEnrollment } = UseUpdateEnrollment();
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

    if (data?.status) {
      const stageValues = filterAndSortEvents(data.events);

      const eventForms = mapEventForms(stageValues);
      const mappedValues = mapSectionValues(eventForms);

      const initialValues = mergeSectionValues(mappedValues);

      setEvents(stageValues);
      localStorage.setItem("stageValues", JSON.stringify(initialValues));
      for (const key in initialValues) {
        if (initialValues.hasOwnProperty(key)) {
          const value = initialValues[key];
          if (Array.isArray(value)) {
            initialValues[key] = value.map((item) => {
              const newItem = {};
              for (const key in item) {
                if (item.hasOwnProperty(key)) {
                  const newKey = key.split(".")[0];
                  newItem[newKey] = item[key];
                }
              }
              return newItem;
            });
          }
        }
      }
      setFormValues(initialValues);
    }
  };

  const filterAndSortEvents = (events) => {
    return events?.filter((event) => event.programStage === stage)?.sort((a, b) => a.created - b.created);
  };

  const mapEventForms = (stageValues) => {
    return stageValues?.map((event) => {
      const dataValues = event?.dataValues || [];
      const dataMap = dataValues.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.dataElement]: curr.value,
        }),
        {}
      );
      return { ...event, ...dataMap };
    });
  };

  const mapSectionValues = (eventForms) => {
    return stageForm?.sections?.map((section) => {
      if (section?.repeating) {
        const sectionIds = section.dataElements.map((item) => item.id);
        const sectionData = eventForms
          ?.map((event) => {
            return sectionIds.reduce((acc, curr) => {
              acc[`${curr}.${event?.event}`] = event?.[curr];
              return acc;
            }, {});
          })
          .filter((item) => Object.values(item).filter((item) => item || item?.toString() === "false")?.length > 0);
        return {
          [section.sectionId]: sectionData?.length > 0 ? sectionData : [{}],
        };
      }
      return section?.dataElements?.reduce((acc, dataElement) => {
        const value = findNonNullValue(eventForms, dataElement.id);
        acc[dataElement.id] = formatValue(value);
        return acc;
      }, {});
    });
  };

  const findNonNullValue = (eventForms, dataElementId) => {
    return (
      eventForms?.find((item) => item?.[dataElementId] !== null && item?.[dataElementId] !== undefined)?.[dataElementId] || null
    );
  };

  const mergeSectionValues = (mappedValues) => {
    return mappedValues?.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  };

  const handleChange = async (value) => {
    const valueKey = Object.keys(value)[0];
    const valueObject = value[valueKey];
    await saveValue(events[0]?.event, valueObject, valueKey, id, program, stage);
  };

  const handleFinish = async (values, event) => {
    setLoading(true);
    try {
      const mainEvent = events[0]?.event;
      const submissions = createPayload(values);
      const mappings = await getData("repeatSections", "postOperative");

      const newFields = submissions.filter((item) => item.status)?.filter((item) => item.dataValues?.length > 0);
      const updateFields = submissions.filter((item) => item.event)?.filter((item) => item.dataValues?.length > 0);

      const newEvents = await Promise.all(
        newFields.map(async (item) => {
          const response = await createEvent(stage, item.dataValues);
          if (response) {
            const newMapping = {
              parentEvent: mainEvent,
              event: response,
            };
            mappings.push(newMapping);
          }
          return response;
        })
      );

      const updateEvents = await Promise.all(
        updateFields.map(async (item) => {
          const response = await completeEvent(item.event, id, program, stage, item.dataValues, "ACTIVE");
          return response;
        })
      );

      await saveData("repeatSections", "postOperative", mappings);

      setSuccess("Event saved successfully");
      const timeout = setTimeout(() => {
        setSuccess(null);
      }, 2000);

      () => clearTimeout(timeout);

      navigate(surgeryLink);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getEnrollment();
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
                surgeryLink={surgeryLink}
              />
            </div>
          </Spin>
        )}
        {success && <Alert success>{success}</Alert>}
      </CardItem>
    </div>
  );
}
