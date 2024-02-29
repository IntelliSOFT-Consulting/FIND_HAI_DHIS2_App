import React from "react";
import { Table } from "antd";
import SurgeryHeader from "./SurgeryHeader";
import Section from "./Section";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  form: {},
  submit: {
    gridColumn: "span 2",
    display: "flex",
    justifyContent: "flex-end",
  },
  content: {
    display: "flex",
    gap: "2rem",
    padding: "1rem",
    "& > div": {
      width: "100% !important",
      "&:nth-child(even)": {
        marginLeft: "auto !important",
      },
    },
  },
});

const Grid = ({ surgery, initialValues }) => {
  const classes = useStyles();
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
    },
  ];
  return (
    <div className={classes.form}>
      <SurgeryHeader title={surgery.title} open={true}>
        {surgery.sections.map((section, index) => {
          return (
            <>
              <Section key={index} title={section.title} />
              <div className={classes.content}>
                <Table
                  columns={columns}
                  dataSource={section.dataElements.map((dataElement) => {
                    return {
                      name: dataElement.name,
                      value: initialValues[dataElement.id],
                    };
                  })}
                  pagination={false}
                  bordered
                  showHeader={false}
                  rowKey={(record) => record.name}
                />
              </div>
            </>
          );
        })}
      </SurgeryHeader>
    </div>
  );
};

export default Grid;
