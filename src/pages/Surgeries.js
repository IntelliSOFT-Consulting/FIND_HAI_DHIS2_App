import React from "react";
import CardItem from "../components/CardItem";
import { Table, Input, Button } from "antd";
import { createUseStyles } from "react-jss";
import { useNavigate } from "react-router-dom";

const useStyles = createUseStyles({
  search: {
    marginBottom: "2rem",
  },
  button: {
    boxShadow: "none !important",
  },
});

export default function Surgeries() {
  const styles = useStyles();

  const navigate = useNavigate();

  const columns = [
    {
      title: "PATIENT ID",
      dataIndex: "patientId",
      key: "patientId",
    },
    {
      title: "SURGERY ID",
      dataIndex: "surgeryId",
      key: "surgeryId",
    },
    {
      title: "DATE OF SURGERY",
      dataIndex: "dateOfSurgery",
      key: "dateOfSurgery",
    },
    {
      title: "SURGERY LOCATION",
      dataIndex: "surgeryLocation",
      key: "surgeryLocation",
    },
    {
      title: "ACTIONS",
      dataIndex: "actions",
      key: "actions",
    },
  ];
  return (
    <CardItem title="SURGERIES">
      <div className={styles.search}>
        <Input.Search
          placeholder="Search surgeries using patient ID or surgery ID"
          size="large"
          enterButton="Search"
        />
      </div>
      <Table
        columns={columns}
        dataSource={[]}
        pagination={{ pageSize: 10 }}
        scroll={{ y: 240 }}
        bordered
        size="small"
        locale={{
          emptyText: (
            <div>
              <p>No Results. Add patient & surgery details</p>

              <Button type="primary" onClick={() => navigate("/forms")}>
                ADD
              </Button>
            </div>
          ),
        }}
      />
    </CardItem>
  );
}
