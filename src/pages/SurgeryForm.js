import React, { useEffect, useState } from "react";
import { Table, Button, Badge, Breadcrumb } from "antd";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import UseGetEnrollmentsData from "../hooks/UseGetEnrollmentsData";
import UseCreateEvent from "../hooks/useCreateEvent";
import UseUpdateEnrollment from "../hooks/useUpdateEnrollment";
import UseDataStore from "../hooks/useDataStore";
import { formatValues } from "../lib/mapValues";
import Section from "../components/Section";
import moment from "moment";
import { createUseStyles } from "react-jss";
import { DoubleLeftOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import { statusColor } from "../lib/helpers";
import { CircularLoader } from "@dhis2/ui";
import Overdue from "../components/Overdue";
import EditSurgeryDetails from "../components/EditSurgeryDetails";
import { getFullEvents } from "../lib/stages";

const useStyles = createUseStyles({
  "@global": {
    ".ant-table": {
      borderRadius: "0px !important",
      "& *": {
        borderRadius: "0px !important",
      },
    },
  },
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
  edit: {
    display: "flex",
    justifyContent: "center",
    color: "#2C6693!important",
    "& > button": {
      color: "#2C6693!important",
    },
  },
});

export default function SurgeryForm({ history }) {
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [formValues, setFormValues] = useState(null);
  const [showOverdue, setShowOverdue] = useState(false);
  const [open, setOpen] = useState(false);

  const { registration, stages, trackedEntity, program } = useSelector((state) => state.forms);
  const user = useSelector((state) => state.user);

  const classes = useStyles();

  const { trackedEntityInstance, enrollment } = useParams();
  const navigate = useNavigate();

  const { getEnrollmentData } = UseGetEnrollmentsData();
  const { createEvent, createStageEvents } = UseCreateEvent();
  const { updateEnrollment } = UseUpdateEnrollment();
  const { getData, saveData } = UseDataStore();

  const getEnrollment = async () => {
    const data = await getEnrollmentData();
    setEnrollmentData(data);
    const enrollmentValues = formatValues(registration, data);
    const stagesValues = stages?.map((stage) => {
      const stageValues = data?.events?.filter((event) => event.programStage === stage.stageId);
      return {
        ...stage,
        events: stageValues?.map((stageValue) => {
          return {
            repeatable: stage?.repeatable,
            repeattype: stage?.repeattype,
            title: stage.title,
            ...(stageValue?.dataValues?.length > 0
              ? stageValue
              : {
                  event: stageValue?.event,
                  status: stageValue?.status,
                  programStage: stageValue?.programStage,
                  title: stage.title,
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
      width: "40%",
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
      width: "60%",
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
        const params =
          record?.repeatable && record?.title?.toLowerCase()?.includes("post-operative") ? `?event=${record?.event}` : "";
        const userCanEdit = user?.userRoles?.some((role) =>
          ["superuser", "administrator", "admin", "pca - administrator"].includes(role?.displayName?.toLowerCase())
        );
        return (
          <div>
            <Link to={`/surgery/${record.programStage}/enrollment/${enrollment}/tei/${trackedEntityInstance}/view${params}`}>
              <Button type="link">View</Button>
            </Link>
            {(enrollmentData?.status === "ACTIVE" || userCanEdit) && (
              <Link to={`/surgery/${record.programStage}/enrollment/${enrollment}/tei/${trackedEntityInstance}/edit${params}`}>
                <Button type="link">Edit</Button>
              </Link>
            )}
          </div>
        );
      },
    },
  ];

  const addEvent = async (stage, isNew = false) => {
    const emptyEvent = stage?.events?.find((event) => event?.dataValues?.length === 0 || !event?.dataValues)?.event;

    let params = "";

    const isRepeat = stage?.repeatable && stage.title?.toLowerCase()?.includes("post-operative");
    if (emptyEvent && !isNew) {
      params = isRepeat ? `?event=${emptyEvent}` : "";
      return navigate(`/surgery/${stage.stageId}/enrollment/${enrollment}/tei/${trackedEntityInstance}${params}`);
    }

    let mappings = await getData("repeatSections", "postOperative");
    if (!Array.isArray(mappings)) {
      mappings = [];
    }

    const childStages = stage?.children?.map((child) => child?.stageId);
    const stageIds = stage?.sections?.length ? [stage.stageId, ...childStages] : childStages;
    const events = await createStageEvents(stageIds, []);
    if (events) {
      // remove first event and remain with the rest
      const newMappings = events.slice(1).map((event) => {
        return {
          parentEvent: events[0],
          event,
        };
      });
      await saveData("repeatSections", "postOperative", [...mappings, ...newMappings]);
      params = isRepeat ? `?event=${events[0]}` : "";
      navigate(`/surgery/${stage.stageId}/enrollment/${enrollment}/tei/${trackedEntityInstance}${params}`);
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
          <Breadcrumb
            separator={<DoubleLeftOutlined />}
            style={{ marginBottom: "1rem" }}
            items={[
              {
                title: <Link to="/surgeries">Surgeries</Link>,
              },
              {
                title: "Surgery Details",
              },
            ]}
          />
          <Badge.Ribbon
            text={
              enrollmentData?.status === "ACTIVE" ? "ACTIVE" : enrollmentData?.status === "COMPLETED" ? "COMPLETED" : "CLOSED"
            }
            color={statusColor(enrollmentData?.status)}
          >
            <Section title="SURGERY SUMMARY" primary />
          </Badge.Ribbon>
          {formValues?.enrollmentValues?.map((section, index) => (
            <>
              <Section title={section.title?.replace("SURGERY SUMMARY", "")} key={index} padded />
              <Table
                columns={columns}
                dataSource={section.dataElements}
                pagination={false}
                rowKey={(record) => record.id}
                size="small"
                showHeader={false}
                bordered
                footer={
                  index === formValues?.enrollmentValues?.length - 1
                    ? () => (
                        <div className={classes.edit}>
                          {enrollmentData?.status === "ACTIVE" && (
                            <Button type="link" onClick={() => setOpen(true)} icon={<EditOutlined />}>
                              Edit Surgery Details
                            </Button>
                          )}
                        </div>
                      )
                    : false
                }
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
              {!stage?.repeatable || (stage?.repeatable && !stage?.title?.toLowerCase()?.includes("post-operative"))
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
                : getFullEvents(enrollmentData, stage)?.events?.map(
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

              {stage?.repeatable &&
                stage?.title?.toLowerCase()?.includes("post-operative") &&
                getFullEvents(enrollmentData, stage)?.events?.length < 3 && (
                  <div className={classes.newEvent}>
                    <Button onClick={() => addEvent(stage, true)} type="dashed" icon={<PlusOutlined />} block>
                      Add {stage?.title?.toLowerCase()?.includes("pathogen information") ? "Pathogen Information" : "Stage"}
                    </Button>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
      <Overdue overdue={showOverdue} setOverdue={setShowOverdue} onFinish={handleOverdue} />
      <EditSurgeryDetails
        open={open}
        setOpen={setOpen}
        onClose={() => setOpen(false)}
        enrollment={enrollmentData}
        getEnrollment={getEnrollment}
      />
    </>
  );
}
