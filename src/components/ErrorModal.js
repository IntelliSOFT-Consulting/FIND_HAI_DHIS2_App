import React from "react";
import { Divider, List, Modal } from "antd";
import { Link } from "react-router-dom";

export default function ErrorModal({ enrollments, enroll, values, setEnrollments, setLoading }) {
  const renderData = () => {
    return (
      <div>
        <Divider orientation="left">This patient has existing surgeries</Divider>
        <List
          size="small"
          bordered
          dataSource={enrollments}
          renderItem={(enrollment) => {
            const surgeryName = enrollment?.attributes?.find((item) => item.displayName === "Surgical Procedure")?.value;
            return (
              <List.Item>
                <Link to={`/surgery/${enrollment?.trackedEntityInstance}/${enrollment?.enrollment}`}>{surgeryName}</Link>
              </List.Item>
            );
          }}
        />
      </div>
    );
  };

  return (
    <Modal
      open={enrollments}
      onCancel={() => {
        setEnrollments(null);
        setLoading(false);
      }}
      onOk={() => enroll(values)}
      okText="Register new surgery?"
    >
      {renderData()}
    </Modal>
  );
}
