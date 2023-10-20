import React, { useEffect, useState } from "react";
import { Table, Badge } from "antd";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { isValidDate } from "../lib/helpers";
import Section from "../components/Section";
import moment from "moment";
import CardItem from "../components/CardItem";
import UseGetEvent from "../hooks/useGetEvent";
import { Button, CircularLoader } from "@dhis2/ui";
import { DoubleLeftOutlined } from "@ant-design/icons";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  backButton: {
    marginBottom: "1rem",
  },
});

export default function ViewStage() {
  const [formValues, setFormValues] = useState(null);
  const [status, setStatus] = useState(null);
  const [surgeryLink, setSurgeryLink] = useState(null);
  const { stages } = useSelector((state) => state.forms);

  const { stage, event } = useParams();

  const classes = useStyles();

  const { getEvent } = UseGetEvent();

  const stageForm = stages?.find((item) => item.id === stage);

  const fetchValues = async () => {
    const data = await getEvent(event);
    setStatus(data?.status);
    setSurgeryLink(
      `/surgery/${data?.trackedEntityInstance}/${data?.enrollment}`
    );
    const values = data?.dataValues?.reduce((acc, curr) => {
      acc[curr.id] = isValidDate(curr.value)
        ? moment(curr.value).format("DD MMM YYYY")
        : curr.value;
      return acc;
    }, {});

    setFormValues(values);
  };

  useEffect(() => {
    if (event && event !== "undefined") {
      fetchValues();
    } else {
      setFormValues({});
    }
  }, [event]);

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
      render: (text) => {
        let formattedText = text;
        if (isValidDate(text)) {
          formattedText = moment(text).format("DD MMM YYYY");
        } else if (text === true) {
          formattedText = "Yes";
        } else if (text === false) {
          formattedText = "No";
        }
        return formattedText;
      },
    },
  ];

  let content;
  if (!formValues) {
    content = <CircularLoader />;
  } else {
    content = (
      <>
        {stageForm?.sections?.map((section) => (
          <React.Fragment key={section.id}>
            <Section title={section.title} />

            <Table
              columns={columns}
              dataSource={section?.dataElements?.map((dataElement) => ({
                key: dataElement.id,
                name: dataElement.name,
                value: formValues[dataElement.id],
              }))}
              pagination={false}
              bordered
              showHeader={false}
            />
          </React.Fragment>
        ))}
      </>
    );
  }

  return (
    <Badge.Ribbon
      text={status}
      color={
        status === "COMPLETED"
          ? "purple"
          : status === "ACTIVE"
          ? "cyan"
          : "gold"
      }
    >
      {surgeryLink && (
        <Link to={surgeryLink}>
          <Button
            icon={<DoubleLeftOutlined />}
            className={classes.backButton}
            size="small"
          >
            Back to Surgery Overview
          </Button>
        </Link>
      )}
      <CardItem title={stageForm?.title}>{content}</CardItem>
    </Badge.Ribbon>
  );
}
