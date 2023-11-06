import React, { useEffect, useState } from "react";
import { Table, Button, Badge } from "antd";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import UseGetEnrollmentsData from "../hooks/UseGetEnrollmentsData";
import UseCreateEvent from "../hooks/useCreateEvent";
import UseUpdateEnrollment from "../hooks/useUpdateEnrollment";
import { formatValues } from "../lib/mapValues";
import Section from "../components/Section";
import moment from "moment";
import { createUseStyles } from "react-jss";
import { PlusOutlined } from "@ant-design/icons";
import { statusColor } from "../lib/helpers";
import { CircularLoader } from "@dhis2/ui";
import Overdue from "../components/Overdue";
import { getFullEvents, isAddStageActive } from "../lib/stages";


const useStyles = createUseStyles({
  header: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  section: {
    border: "1px solid #D4DFE7",
    padding: "10px",
    margin: "1rem 0px",
  },
  newEvent: {
    display: "flex",
    justifyContent: "center",
    padding: "10px 2rem",
  },
  event: {
    margin: "1rem 0px",
  },
});

export default function SurgeryForm() {
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [formValues, setFormValues] = useState(null);
  const [showOverdue, setShowOverdue] = useState(false);

  const { registration, stages, trackedEntity, program } = useSelector((state) => state.forms);


  const classes = useStyles();

  const { trackedEntityInstance, enrollment } = useParams();
  const navigate = useNavigate();

  const { getEnrollmentData } = UseGetEnrollmentsData();
  const { createEvent } = UseCreateEvent();
  const { updateEnrollment } = UseUpdateEnrollment();

  const getEnrollment = async () => {
    const data = await getEnrollmentData();
    setEnrollmentData(data);
    const enrollmentValues = formatValues(registration, data);
    const stagesValues = stages?.map((stage) => {
      const stageValues = data?.events?.filter((event) => event.programStage === stage.id);

      return {
        ...stage,
        events: stageValues?.map((stageValue) => {
          return {
            repeatable: stage?.repeatable,
            repeattype: stage?.repeattype,
            ...(stageValue?.dataValues?.length > 0
              ? stageValue
              : {
                  event: stageValue?.event,
                  status: stageValue?.status,
                }),
          };
        }),
      };
    });
    const values = { enrollmentValues, stagesValues };
    setFormValues(values);
  };

  useEffect(() => {
    if (trackedEntityInstance && enrollment) {
      getEnrollment();
    }
  }, [registration]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (text, record) => {
        if (record.valueType === "DATE") {
          return moment(text).format("YYYY-MM-DD");
        }
        return text;
      },
    },
  ];

  const stageColumns = [
    {
      title: "Date",
      dataIndex: "created",
      key: "created",
      render: (text) => moment(text).format("YYYY-MM-DD"),
    },

    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (text, record) => {
        const params = record?.repeatable && record?.repeattype !== "section" ? `?event=${record?.event}` : "";
        return (
          <div>
            <Link to={`/surgery/${record.programStage}/enrollment/${enrollment}/tei/${trackedEntityInstance}/view${params}`}>
              <Button type="link">View</Button>
            </Link>
            {enrollmentData?.status === "ACTIVE" && (
              <Link to={`/surgery/${record.programStage}/enrollment/${enrollment}/tei/${trackedEntityInstance}/edit${params}`}>
                <Button type="link">Edit</Button>
              </Link>
            )}
          </div>
        );
      },
    },
  ];

  const addEvent = async (stage) => {
    const emptyEvent = stage?.events?.find((event) => event?.dataValues?.length === 0 || !event?.dataValues)?.event;

    let params = "";

    if (emptyEvent) {
      params = stage?.repeatable && stage?.repeattype !== "section" ? `?event=${emptyEvent}` : "";
      return navigate(`/surgery/${stage.id}/enrollment/${enrollment}/tei/${trackedEntityInstance}${params}`);
    }
    const event = await createEvent(stage.id);
    if (event) {
      params = stage?.repeatable && stage?.repeattype !== "section" ? `?event=${event}` : "";
      navigate(`/surgery/${stage.id}/enrollment/${enrollment}/tei/${trackedEntityInstance}${params}`);
    }
  };

  const checkIfEventEmpty = (events) => {
    return events?.every((event) => {
      return !event || !event?.dataValues || event?.dataValues?.length === 0;
    });
  };

  const checkIfOverdue = async () => {
    if (formValues) {
      const dateOfSurgery = formValues?.enrollmentValues
        ?.flatMap((section) => section?.dataElements)
        ?.find((dataElement) => dataElement?.name === "Date of Surgery")?.value;

      if (dateOfSurgery) {
        const date = moment(dateOfSurgery);
        const today = moment();
        const diff = today.diff(date, "weeks");
        if (diff > 6 && enrollmentData?.status !== "CANCELLED") {
          setShowOverdue(true);
        } else {
          setShowOverdue(false);
        }
      }
    }
  };

  const handleOverdue = async (values, stage) => {
    const payload = Object.keys(values).map((key) => ({
      dataElement: key,
      value: values[key],
    }));

    const event = await createEvent(stage, payload);
    if (event) {
      const updatedEnrollmentData = {
        ...enrollmentData,
        status: "CANCELLED",
      };
      delete updatedEnrollmentData?.events;

      await updateEnrollment(enrollment, updatedEnrollmentData);
      getEnrollment();
    }
  };

  useEffect(() => {
    checkIfOverdue();
  }, [formValues]);

  return (
    <>
      {!formValues ? (
        <CircularLoader />
      ) : (
        <div>
          <Badge.Ribbon
            text={enrollmentData?.status !== "ACTIVE" ? "CLOSED" : "ACTIVE"}
            color={statusColor(enrollmentData?.status)}
          >
            <Section title={<h3>Status: {enrollmentData?.status}</h3>} primary padded />
          </Badge.Ribbon>
          {formValues?.enrollmentValues?.map((section, index) => (
            <>
              <Section title={section.title} key={index} padded />
              <Table
                columns={columns}
                dataSource={section.dataElements}
                pagination={false}
                rowKey={(record) => record.id}
                size="small"
                showHeader={false}
                bordered
              />
            </>
          ))}
          {formValues?.stagesValues?.map((stage, index) => (
            <div className={classes.section} key={index}>
              <Section
                title={
                  <div className={classes.header}>
                    {stage.title}
                    {checkIfEventEmpty(stage?.events) && enrollmentData?.status === "ACTIVE" && (
                      <div onClick={() => addEvent(stage)}>
                        <Button type="primary">Add</Button>
                      </div>
                    )}
                  </div>
                }
              />
              {stage?.repeattype === "section"
                ? stage?.events?.slice(0, 1)?.map((event, i) => (
                    <div className={classes.event} key={i}>
                      <Table
                        columns={stageColumns}
                        dataSource={[event]}
                        pagination={false}
                        rowKey={(record) => record.id}
                        size="small"
                        bordered
                      />
                    </div>
                  ))
                : getFullEvents(stage)?.events?.map(
                    (event, i) =>
                      event?.dataValues && (
                        <div className={classes.event} key={i}>
                          <Table
                            columns={stageColumns}
                            dataSource={[event]}
                            pagination={false}
                            rowKey={(record) => record.id}
                            size="small"
                            bordered
                          />
                        </div>
                      )
                  )}

              {isAddStageActive(stage, enrollmentData) && (
                <div className={classes.newEvent}>
                  <Button onClick={() => addEvent(stage)} type="dashed" icon={<PlusOutlined />} block>
                    Add {stage?.title?.toLowerCase()?.includes("pathogen information") ? "Pathogen Information" : "Stage"}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Overdue overdue={showOverdue} setOverdue={setShowOverdue} onFinish={handleOverdue} />
    </>
  );
}
