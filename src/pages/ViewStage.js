import React, { useEffect, useState } from "react";
import { Table, Badge, Button, Breadcrumb } from "antd";
import { Link, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { isValidDate } from "../lib/helpers";
import Section from "../components/Section";
import moment from "moment";
import CardItem from "../components/CardItem";
import { CircularLoader } from "@dhis2/ui";
import { DoubleLeftOutlined } from "@ant-design/icons";
import { createUseStyles } from "react-jss";
import UseGetEnrollmentsData from "../hooks/UseGetEnrollmentsData";
import UseViewData from "../hooks/UseViewData";

const useStyles = createUseStyles({
  "@global": {
    ".ant-table": {
      borderRadius: "0px !important",
      "& *": {
        borderRadius: "0px !important",
      },
    },
  },
  backButton: {
    marginBottom: "1rem",
  },
});

export default function ViewStage() {
  const [status, setStatus] = useState(null);
  const { stages } = useSelector((state) => state.forms);

  const { getEnrollmentData } = UseGetEnrollmentsData();

  const { dataViewModel, setEnrollment } = UseViewData();

  const { stage, enrollment, trackedEntityInstance } = useParams();
  const surgeryLink = `/surgery/${trackedEntityInstance}/${enrollment}`;

  const classes = useStyles();

  const stageForm = stages?.find((item) => item.id === stage);

  const getEnrollment = async () => {
    const data = await getEnrollmentData();
    setEnrollment(data);
  };

  useEffect(() => {
    if (enrollment) {
      getEnrollment();
    }
  }, [enrollment]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "60%",
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
  if (!dataViewModel) {
    content = <CircularLoader />;
  } else {
    content = (
      <>
        {dataViewModel?.sections?.map((section) => (
          <React.Fragment key={section.id}>
            <Section title={section.title} />
            <Table columns={columns} dataSource={section?.dataElements} pagination={false} bordered showHeader={false} />
          </React.Fragment>
        ))}
      </>
    );
  }

  return (
    <Badge.Ribbon text={status} color={status === "COMPLETED" ? "purple" : status === "ACTIVE" ? "cyan" : "gold"}>
      {surgeryLink && (
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
      )}
      <CardItem title={stageForm?.title}>{content}</CardItem>
    </Badge.Ribbon>
  );
}
