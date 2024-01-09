import React, { useEffect, useState } from "react";
import { Table, Button, Badge, Breadcrumb, Tooltip, Card } from "antd";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setAttributes } from "../redux/actions";
import UseGetEnrollmentsData from "../hooks/useInstances";
import useEnrollment from "../hooks/useEnrollment";
import UseCreateEvent from "../hooks/useEvents";
import UseDataStore from "../hooks/useDataStore";
import { formatValues } from "../lib/mapValues";
import Section from "../components/Section";
import moment from "moment";
import { createUseStyles } from "react-jss";
import { DoubleLeftOutlined, PlusOutlined, EditOutlined, PrinterOutlined, DownloadOutlined } from "@ant-design/icons";
import { disableMicrobiology, statusColor } from "../lib/helpers";
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
    ".ant-card": {
      borderRadius: "0px !important",
      "& div": {
        borderRadius: "0px !important",
      },
    },
    ".ant-card-body": {
      padding: "10px !important",
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
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "10px 0px",
    borderTop: "1px solid #D4DFE7",
    marginTop: "1rem",
    "& button": {
      marginLeft: "1rem",
    },
  },
});

export default function SurgeryForm() {
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [formValues, setFormValues] = useState(null);
  const [showOverdue, setShowOverdue] = useState(false);
  const [discontinue, setDiscontinue] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMicrobiologyDisabled, setIsMicrobiologyDisabled] = useState(false);
  const [stagesData, setStagesData] = useState(null);

  const { registration, stages } = useSelector((state) => state.forms);
  const user = useSelector((state) => state.user);

  const classes = useStyles();

  const dispatch = useDispatch();

  const { trackedEntityInstance, enrollment } = useParams();
  const navigate = useNavigate();

  const { getEnrollmentData, createEvent, createStageEvents, updateEnrollment, getData, saveData } = {
    ...UseGetEnrollmentsData(),
    ...UseCreateEvent(),
    ...UseDataStore(),
    ...useEnrollment(),
  };

  const createStagesData = (enrollmentDatas) => {
    const stagesData = formValues?.stagesValues?.flatMap((stage) => {
      const events =
        !stage?.repeatable || (stage?.repeatable && !stage?.multiple)
          ? stage?.events?.slice(0, 1)
          : getFullEvents(enrollmentDatas, stage)?.events;

      return events?.map((event) => {
        return {
          enrollment,
          trackedEntityInstance,
          programStage: event?.programStage,
          event: stage?.multiple ? event?.event : null,
          name: stage.title,
        };
      });
    });

    setStagesData(stagesData);
  };

  const getEnrollment = async () => {
    const data = await getEnrollmentData();

    setEnrollmentData(data);

    if (!data) return;
    const attributes = data?.attributes?.map((attribute) => ({
      id: attribute.attribute,
      name: attribute?.displayName,
      valueType: attribute?.valueType,
      value: attribute?.value,
    }));

    dispatch(setAttributes(attributes));

    const enrollmentValues = formatValues(registration, data);

    const stagesValues = stages?.map((stage) => {
      const stageValues = data?.events?.filter((event) => event.programStage === stage.stageId);

      return {
        ...stage,
        events: stageValues.map((stageValue) => ({
          ...stageValue,
          repeatable: stage.repeatable,
          multiple: stage.multiple,
          title: stage.title,
        })),
      };
    });

    await setFormValues({ enrollmentValues, stagesValues });
  };

  useEffect(() => {
    if (formValues) {
      createStagesData(enrollmentData);
    }
  }, [formValues]);

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
        const stageForm = stages?.find((stage) => stage?.stageId === record?.programStage);

        const params = record?.repeatable && stageForm?.multiple ? `?event=${record?.event}` : "";
        const userCanEdit = user?.userRoles?.some((role) =>
          ["superuser", "administrator", "admin", "pca - administrator"].includes(role?.displayName?.toLowerCase())
        );

        const sampleSentForCulture = disableMicrobiology(stageForm, enrollmentData?.events);

        if (!sampleSentForCulture && stageForm?.multiple) {
          setIsMicrobiologyDisabled(true);
        }
        const isDisabled = stageForm?.title?.toLowerCase()?.includes("pathogen information") && isMicrobiologyDisabled;

        return (
          <Tooltip title={isDisabled ? '"Samples sent for culture?" must be answered "Yes" to enable this section.' : ""}>
            <div style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}>
              <div className={isDisabled ? "unclickable" : ""}>
                <Link to={`/surgery/${record.programStage}/enrollment/${enrollment}/tei/${trackedEntityInstance}/view${params}`}>
                  <Button type="link">View</Button>
                </Link>
                {(enrollmentData?.status === "ACTIVE" || userCanEdit) && (
                  <Link
                    to={`/surgery/${record.programStage}/enrollment/${enrollment}/tei/${trackedEntityInstance}/edit${params}`}
                  >
                    <Button type="link">Edit</Button>
                  </Link>
                )}
              </div>
            </div>
          </Tooltip>
        );
      },
    },
  ];

  const addEvent = async (stage, isNew = false) => {
    const emptyEvent = stage?.events?.find((event) => event?.dataValues?.length === 0 || !event?.dataValues)?.event;

    let params = "";

    const isRepeat = stage?.repeatable && stage.multiple;
    if (emptyEvent && !isNew) {
      params = isRepeat ? `?event=${emptyEvent}` : "";
      return navigate(`/surgery/${stage.stageId}/enrollment/${enrollment}/tei/${trackedEntityInstance}${params}`);
    }

    let mappings = await getData("repeatSections", "postOperative");
    if (!Array.isArray(mappings)) {
      mappings = [];
    }

    const stageIds = [...new Set(stage?.sections?.map((section) => section?.stageId))];

    const events = await createStageEvents(stageIds, []);
    if (events) {
      // remove first event and remain with the rest
      const eventsMapped = stage.multiple ? events : events.slice(1);
      const newMappings = eventsMapped.map((event) => {
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
      await getEnrollment();
      setDiscontinue(false);
    }
  };

  useEffect(() => {
    checkIfOverdue();
  }, [formValues]);

  const footer = stagesData && (
    <Button
      type="primary"
      onClick={() => {
        navigate(`/print/enrollment/${enrollment}/tei/${trackedEntityInstance}`, {
          state: stagesData,
        });
      }}
      icon={<DownloadOutlined />}
    >
      Download
    </Button>
  );

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
          <Card>
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
            {formValues?.stagesValues?.map((stage, index) => {
              const isDisabled = stage?.title?.toLowerCase()?.includes("pathogen information") && isMicrobiologyDisabled;
              return (
                <div className={classes.section} key={index}>
                  <Section
                    title={
                      <Tooltip
                        title={isDisabled ? '"Samples sent for culture?" must be answered "Yes" to enable this section.' : ""}
                      >
                        <div className={classes.header}>
                          {stage.title}
                          {checkIfEventEmpty(stage?.events) && enrollmentData?.status === "ACTIVE" && (
                            <div>
                              <Button
                                style={{
                                  cursor: isDisabled ? "not-allowed" : "pointer",
                                  opacity: isDisabled ? 0.7 : 1,
                                }}
                                disabled={isDisabled}
                                onClick={() => addEvent(stage)}
                                type="primary"
                              >
                                Add
                              </Button>
                            </div>
                          )}
                        </div>
                      </Tooltip>
                    }
                  />

                  {!stage?.repeatable || (stage?.repeatable && !stage?.multiple)
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

                  {stage?.multiple && getFullEvents(enrollmentData, stage)?.events?.length < 3 && (
                    <div className={classes.newEvent}>
                      <Button onClick={() => addEvent(stage, true)} type="dashed" icon={<PlusOutlined />} block>
                        Add {stage?.title?.toLowerCase()?.includes("pathogen information") ? "Pathogen Information" : "Stage"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            <div className={classes.footer}>
              {enrollmentData?.status === "ACTIVE" && (
                <Button danger onClick={() => setDiscontinue(true)}>
                  Discontinue
                </Button>
              )}
              {footer}
            </div>
          </Card>
        </div>
      )}

      <Overdue
        overdue={showOverdue}
        setOverdue={setShowOverdue}
        onFinish={handleOverdue}
        setDiscontinue={setDiscontinue}
        discontinue={discontinue}
        surgeryLink={`/surgery/${trackedEntityInstance}/${enrollment}`}
      />
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
