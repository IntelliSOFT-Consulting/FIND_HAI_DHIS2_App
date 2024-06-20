import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createUseStyles } from "react-jss";
import { Button, DatePicker, Input, Select, Space, Spin, Table, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import moment from "moment";
import CardItem from "../components/CardItem";
import { debounce, generateWeeks, isValidDate } from "../lib/helpers";
import useInstances from "../hooks/useInstances";

const useStyles = createUseStyles({
  search: {
    marginBottom: "2rem",
    display: "flex",
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

export default function Surgeries() {
  const [instances, setInstances] = useState(null);
  const [weeks, _] = useState(generateWeeks());
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const styles = useStyles();
  const navigate = useNavigate();

  const { program } = useSelector((state) => state.forms);

  const { getSurgeries } = useInstances();

  const fetchSurgeries = async () => {
    if (!program) return;
    const instances = await getSurgeries("", program, currentPage, 12);
    setInstances(instances?.results);
    setTotal(instances?.total);
  };

  useEffect(() => {
    if (program) fetchSurgeries();
  }, [program, currentPage]);

  const searchSurgeries = async (query = "") => {
    const searched = await getSurgeries(query, program, currentPage, 12);
    setInstances(searched?.results);
    setTotal(searched?.total);
  };

  const getSurgeriesDebounced = debounce(searchSurgeries, 400);

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
          <Button type="link" onClick={() => navigate(`/surgery/${record?.trackedEntity}/${record?.enrollment}`)}>
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

      <Spin spinning={!instances} tip="Loading...">
        <Table
          columns={columns}
          dataSource={
            instances?.flatMap((instance) => {
              const object = {};
              instance?.attributes?.forEach((attribute) => {
                object[attribute?.displayName] = attribute?.value;
              });

              return {
                ...object,
                trackedEntity: instance?.trackedEntity,
                trackedEntityType: instance?.trackedEntityType,
                enrollment: instance?.enrollment,
                status: instance?.status,
              };
            }) || []
          }
          rowKey={(record) => record?.trackedEntity}
          bordered
          size="small"
          locale={{
            emptyText: (
              <div>
                <p>No Results. Add patient & surgery details</p>
                <Button type="primary" onClick={() => navigate("/register")} icon={<PlusOutlined />}>
                  Register new surgery
                </Button>
              </div>
            ),
          }}
          pagination={{
            total,
            pageSize: 12,
            hideOnSinglePage: true,
            current: currentPage,
            showSizeChanger: false,
            onChange: (page) => {
              setCurrentPage(page);
            },
          }}
        />
      </Spin>
    </CardItem>
  );
}
