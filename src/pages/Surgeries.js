import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createUseStyles } from "react-jss";
import { useDataEngine } from "@dhis2/app-runtime";
import { Input, Button, Space, Tag, Table, DatePicker, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { CircularLoader } from "@dhis2/ui";
import moment from "moment";
import CardItem from "../components/CardItem";
import { isValidDate, generateWeeks } from "../lib/helpers";

const useStyles = createUseStyles({
  search: {
    marginBottom: "2rem",
    display: "flex",
    // gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    alignItems: "center",
    "& > div, > span": {
      width: "100% !important",
    },
    "@media (max-width: 768px)": {
        flexDirection: "column",
        "& > div, > span": {
            width: "100% !important",
        },
    },
  },
  datePicker: {
    marginLeft: "1rem",
    "@media (max-width: 768px)": {
      marginLeft: 0,
    },
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

export default function Surgeries({ program }) {
  const [instances, setInstances] = useState(null);
  const [weeks, _] = useState(generateWeeks());
  const styles = useStyles();
  const navigate = useNavigate();
  const engine = useDataEngine();
  const { registration } = useSelector((state) => state.forms);

  useEffect(() => {
    getSurgeries();
  }, []);

  const getSurgeries = async (query = "") => {
    let startDate;
    let endDate;
    if (query?.includes("..")) {
      const dates = query?.split("..");
      startDate = dates[0];
      endDate = dates[1];
      query = "";
    }
    const dataElementIds = registration?.sections?.flatMap((section) => {
      return section?.dataElements?.filter((dataElement) => {
        return dataElement?.name === "Secondary ID" || dataElement?.name === "Patient ID";
      });
    });

    query = query?.trim();

    const options = {
      events: {
        resource: `trackedEntityInstances.json`,
        params: {
          fields: ["trackedEntityInstance", "trackedEntityType", "attributes[attribute,value]", "enrollments[*]"],
          order: "created:desc",
          ouMode: "ALL",
          program: program?.id,
          pageSize: 100,
        },
      },
    };

    if (query) {
      const results = await Promise.all(
        dataElementIds?.map(async (dataElement) => {
          const filterQuery = query
            ? {
                filter: `${dataElement?.id}:ILIKE:${query}`,
              }
            : {};
          const { events } = await engine.query({
            ...options,
            events: {
              ...options.events,
              params: {
                ...options.events.params,
                ...filterQuery,
              },
            },
          });

          const trackedEntityInstances = events?.trackedEntityInstances;

          const enrollments = trackedEntityInstances?.flatMap((instance) => {
            return instance?.enrollments?.map((enrollment) => {
              return {
                ...enrollment,
                trackedEntityType: instance?.trackedEntityType,
                trackedEntityInstance: instance?.trackedEntityInstance,
              };
            });
          });
          return enrollments?.filter(
            (enrollment, index, self) =>
              index === self.findIndex((t) => t.trackedEntityInstance === enrollment.trackedEntityInstance)
          );
        })
      );
      const enrollments = results?.flatMap((result) => result);
      setInstances(enrollments);
      return enrollments;
    }

    if (startDate && endDate) {
      const dateOfSurgeryDataElement = registration?.sections?.flatMap((section) => {
        return section?.dataElements?.filter((dataElement) => {
          return dataElement?.name?.toLowerCase() === "date of surgery";
        });
      })[0];

      options.events.params = {
        ...options.events.params,
        filter: `${dateOfSurgeryDataElement?.id}:ge:${startDate}&${dateOfSurgeryDataElement?.id}:le:${endDate}`,
      };
    }

    const { events } = await engine.query(options);
    const trackedEntityInstances = events?.trackedEntityInstances;

    const enrollments = trackedEntityInstances?.flatMap((instance) => {
      return instance?.enrollments?.map((enrollment) => {
        return {
          ...enrollment,
          trackedEntityType: instance?.trackedEntityType,
          trackedEntityInstance: instance?.trackedEntityInstance,
        };
      });
    });

    setInstances(enrollments);
    return enrollments;
  };

  const debounce = (func, wait) => {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  };

  const getSurgeriesDebounced = debounce(getSurgeries, 400);

  const renderDate = (text) => {
    return isValidDate(text) ? moment(text).format("DD MMM YYYY") : text;
  };

  const renderStatus = (text) => (
    <Tag color={text === "ACTIVE" ? "green" : "default"}>{text === "CANCELLED" ? "CLOSED" : text}</Tag>
  );

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
      render: renderDate,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
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
          <Button type="link" onClick={() => navigate(`/surgery/${record?.trackedEntityInstance}/${record?.enrollment}`)}>
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <CardItem title="SURGERIES">
      <div className={styles.addButton}>
        <Button type="primary" onClick={() => navigate("/register")} icon={<PlusOutlined />}>
          Register new surgery
        </Button>
      </div>
      <div className={styles.search}>
        <Input.Search
          placeholder="Search surgeries using patient ID or surgery ID"
          enterButton="Search"
          allowClear
          onChange={(e) => getSurgeriesDebounced(e.target.value)}
        />
        <DatePicker.RangePicker
          onChange={(dates) => {
            if (dates?.length) {
              getSurgeriesDebounced(dates[0].format("YYYY-MM-DD") + ".." + dates[1].format("YYYY-MM-DD"));
            } else {
              getSurgeriesDebounced();
            }
          }}
          className={styles.datePicker}
        />
        <Select
          placeholder="Select a week"
          onChange={(value) => {
            if (value) {
              getSurgeriesDebounced(value);
            } else {
              getSurgeriesDebounced();
            }
          }}
          allowClear
          style={{ width: "100%" }}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) => option?.children?.toLowerCase()?.indexOf(input?.toLowerCase()) >= 0}
          options={weeks}
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
          pagination={instances?.length > 10 ? { pageSize: 10 } : false}
          rowKey={(record) => record?.trackedEntityInstance}
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
          scroll={{ x: 700 }}
        />
      )}
    </CardItem>
  );
}
