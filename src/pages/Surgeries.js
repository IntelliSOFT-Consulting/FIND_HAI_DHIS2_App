import React, { useState, useEffect } from "react";
import CardItem from "../components/CardItem";
import { Table, Input, Button, Space, Tag } from "antd";
import { createUseStyles } from "react-jss";
import { useNavigate } from "react-router-dom";
import { useDataEngine } from "@dhis2/app-runtime";
import { isValidDate } from "../lib/helpers";
import { CircularLoader } from "@dhis2/ui";
import { PlusOutlined } from "@ant-design/icons";
import moment from "moment";

const useStyles = createUseStyles({
  search: {
    marginBottom: "2rem",
  },
  button: {
    boxShadow: "none !important",
  },
  addButton: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "1rem",
  },
});

export default function Surgeries({ program, user, organisationUnits }) {
  const [instances, setInstances] = useState(null);
  const [tableColumns, setColumns] = useState([]);
  const styles = useStyles();

  const navigate = useNavigate();

  const engine = useDataEngine();

  const getSurgeries = async (query = "") => {
    query = query?.trim();
    const filter = query ? `filter=US1gCMCXtGq:ilike:${query}OR` : "";
    const { events } = await engine.query({
      events: {
        resource: `trackedEntityInstances.json`,
        params: {
          fields: [
            "trackedEntityInstance",
            "trackedEntityType",
            "attributes[attribute,value]",
            "enrollments[*]",
          ],
          order: "created:desc",
          ouMode: "ALL",
          program: program?.id,
          pageSize: 1000,
        },
      },
    });

    const trackedEntityInstances = events?.trackedEntityInstances;

    console.log("trackedEntityInstances", trackedEntityInstances);

    const enrollments = trackedEntityInstances?.flatMap((instance) => {
      return instance?.enrollments?.map((enrollment) => {
        return {
          ...enrollment,
          trackedEntityType: instance?.trackedEntityType,
          trackedEntityInstance: instance?.trackedEntityInstance,
        };
      });
    });

    if (enrollments) {
      setInstances(enrollments);
    }
  };

  useEffect(() => {
    getSurgeries();
  }, []);

  const columns = [
    {
      title: "Patient ID",
      dataIndex: "Patient ID",
      key: "Patient ID",
    },
    {
      title: "Secondary ID",
      dataIndex: "Secondary ID",
      key: "Secondary ID",
    },
    {
      title: "Date of Surgery",
      dataIndex: "Date of Surgery",
      key: "Date of Surgery",
      render: (text) => {
        if (isValidDate(text)) {
          return moment(text).format("DD MMM YYYY");
        }
        return text;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        return (
          <Tag color={text === "ACTIVE" ? "green" : "default"}>{text}</Tag>
        );
      },
    },
    {
      title: "Surgery Location",
      dataIndex: "Surgery Location",
      key: "Surgery Location",
    },
    {
      title: "Actions",
      dataIndex: "Actions",
      key: "Actions",
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() =>
              navigate(
                `/surgery/${record?.trackedEntityInstance}/${record?.enrollment}`
              )
            }
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  // const debounce = (func, wait) => {
  //   let timeout;
  //   return function (...args) {
  //     const context = this;
  //     clearTimeout(timeout);
  //     timeout = setTimeout(() => func.apply(context, args), wait);
  //   };
  // };

  // const getSurgeriesDebounced = debounce(getSurgeries, 400);
  return (
    <CardItem title="SURGERIES">
      <div className={styles.addButton}>
        <Button
          type="primary"
          onClick={() => navigate("/register")}
          icon={<PlusOutlined />}
        >
          Register new surgery
        </Button>
      </div>
      <div className={styles.search}>
        <Input.Search
          placeholder="Search surgeries using patient ID or surgery ID"
          size="large"
          enterButton="Search"
          allowClear
          // onSearch={(value) => getSurgeries(value)}
          // onChange={(e) => getSurgeriesDebounced(e.target.value)}
        />
      </div>
      {!instances ? (
        <div style={{ textAlign: "center" }}>
          <CircularLoader />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={instances?.flatMap((instance) => {
            const object = {};
            instance?.attributes?.forEach((attribute) => {
              object[attribute?.displayName] = attribute?.value;
            });

            return {
              ...object,
              trackedEntityInstance: instance?.trackedEntityInstance,
              trackedEntityType: instance?.trackedEntityType,
              enrollment: instance?.enrollment,
              status: instance?.status,
            };
          })}
          pagination={
            instances?.length > 10
              ? {
                  pageSize: 10,
                }
              : false
          }
          bordered
          size="small"
          locale={{
            emptyText: (
              <div>
                <p>No Results. Add patient & surgery details</p>

                <Button type="primary" onClick={() => navigate("/register")}>
                  ADD
                </Button>
              </div>
            ),
          }}
        />
      )}
    </CardItem>
  );
}
