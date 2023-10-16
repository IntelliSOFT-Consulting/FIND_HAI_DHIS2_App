import React, { useEffect, useState } from "react";
import { Table, Button } from "antd";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import UseGetEnrollmentsData from "../hooks/UseGetEnrollmentsData";
import UseCreateEvent from "../hooks/useCreateEvent";
import { formatValues } from "../lib/mapValues";
import Section from "../components/Section";
import moment from "moment";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  header: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
});

export default function SurgeryForm() {
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [formValues, setFormValues] = useState(null);
  const { registration, stages, trackedEntity, program } = useSelector(
    (state) => state.forms
  );

  const classes = useStyles();

  const { trackedEntityInstance, enrollment } = useParams();
  const navigate = useNavigate();

  const { getEnrollmentData } = UseGetEnrollmentsData();
  const { createEvent } = UseCreateEvent();

  const getEnrollment = async () => {
    const data = await getEnrollmentData(trackedEntityInstance, enrollment);
    setEnrollmentData(data);
    const enrollmentValues = formatValues(registration, data);
    const stagesValues = stages?.map((stage) => {
      const stageValue = data?.events?.find(
        (event) => event.programStage === stage.id
      );

      return {
        title: stage.title,
        id: stage.id,
        ...(stageValue?.dataValues?.length > 0
          ? stageValue
          : {
              event: stageValue?.event,
              status: stageValue?.status,
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
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      render: (text) => moment(text).format("YYYY-MM-DD"),
    },

    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (text, record) => (
        <div>
          <Link to={`/surgery/${record.id}/event/${record.event}/view`}>
            <Button type="link">View</Button>
          </Link>
          <Link to={`/surgery/${record.id}/event/${record.event}/edit`}>
            <Button type="link">Edit</Button>
          </Link>
        </div>
      ),
    },
  ];

  const addEvent = async (stage) => {
    if (stage?.event) {
      return navigate(`/surgery/${stage.id}/event/${stage.event}`);
    }
    const eventData = {
      program,
      programStage: stage.id,
      trackedEntityInstance,
      enrollment,
      orgUnit: enrollmentData?.orgUnit,
      status: "ACTIVE",
      eventDate: moment().format("YYYY-MM-DD"),
      dataValues: [],
    };
    const event = await createEvent({ events: [eventData] });
    if (event) {
      navigate(`/surgery/${stage.id}/event/${event}`);
    }
  };

  return (
    <div>
      <Section title={<h3>Status: {enrollmentData?.status}</h3>} primary />
      {formValues?.enrollmentValues?.map((section, index) => (
        <>
          <Section title={section.title} key={index} />

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
        <div>
          <Section
            title={
              <div className={classes.header}>
                {stage.title}
                {!stage?.dataValues && (
                  <div onClick={() => addEvent(stage)}>
                    <Button type="primary">Add</Button>
                  </div>
                )}
              </div>
            }
            key={index}
          />
          {stage?.dataValues && (
            <Table
              columns={stageColumns}
              dataSource={[stage]}
              pagination={false}
              rowKey={(record) => record.id}
              size="small"
              bordered
            />
          )}
        </div>
      ))}
    </div>
  );
}
