import React, { useEffect, useState, Fragment } from "react";
import { Breadcrumb, Divider, Table, Button } from "antd";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { CloudDownloadOutlined, DoubleLeftOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { CircularLoader } from "@dhis2/ui";
import Section from "../components/Section";
import CardItem from "../components/CardItem";
import useGetInstances from "../hooks/useInstances";
import UseDataStore from "../hooks/useDataStore";
import { formatDisplayValue } from "../lib/mapValues";
import { createUseStyles } from "react-jss";
import moment from "moment";
import { toTitleCase } from "../lib/helpers";
import html2PDF from "jspdf-html2canvas";

const useStyles = createUseStyles({
  mainSection: {
    marginBottom: "1rem",
  },
  divider: {
    color: "#2B6693 !important",
    borderColor: "#2B6693 !important",
    "& .ant-divider-inner-text": {
      border: "1px solid #2B6693 !important",
    },
  },
});

const Print = () => {
  const [components, setComponents] = useState(null);
  const [attributes, setAttributes] = useState(null);
  const { stages } = useSelector((state) => state.forms);
  const { getEnrollmentData } = useGetInstances();
  const { getData } = UseDataStore();
  const { enrollment, trackedEntityInstance } = useParams();
  const surgeryLink = `/surgery/${trackedEntityInstance}/${enrollment}`;
  const location = useLocation();
  const navigate = useNavigate();
  const classes = useStyles();
  const { state } = location;

  useEffect(() => {
    if (!state) {
      navigate("/surgeries");
    }
  }, [state, navigate]);

  const handleDownload = () => {
    const page = document.getElementById("page");
    html2PDF(page, {
      jsPDF: { format: "a4" },
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      imageType: "image/jpeg",
      output: `./pdf/CRF-${new Date().toISOString().split("T")[0]}.pdf`,
      success: (pdf) => {
        pdf.save(`CRF-${new Date().toISOString().split("T")[0]}.pdf`);
      },
    });
  };

  const tableColumns = [
    {
      title: "Name",
      dataIndex: "displayName",
      key: "displayName",
      width: "40%",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (text, record) => (record.valueType === "DATE" ? moment(text).format("YYYY-MM-DD") : text),
      width: "60%",
    },
  ];

  const getEnrollment = async () => {
    const data = await getEnrollmentData();
    if (data?.status) {
      setAttributes(data?.attributes);
      const datas = await Promise.all(
        state.map(async (item) => {
          const stageForm = stages?.find((stageItem) => stageItem.stageId === item.programStage);
          const stageValues = data?.events?.sort((a, b) => new Date(b?.eventDate).getTime() - new Date(a?.eventDate).getTime());

          if (stageValues) {
            const sections = stageForm.sections?.flatMap((section) => section.stage.sections);
            const columns = createColumns(sections, stageValues);
            return (
              <Fragment key={item.programStage}>
                <div className={classes.mainSection}>
                  <Section title={item?.name} primary />
                </div>
                {columns?.map((column, index) => (
                  <Fragment key={index}>
                    {column?.name?.trim() && column?.data?.length > 0 && (
                      <Divider orientation="left" className={classes.divider}>
                        {toTitleCase(column?.name)}
                      </Divider>
                    )}
                    {column?.data?.length > 0 && (
                      <Table
                        columns={column?.columns || []}
                        dataSource={column?.data || []}
                        pagination={false}
                        bordered
                        style={{ marginBottom: "1rem" }}
                        size="small"
                      />
                    )}
                  </Fragment>
                ))}
              </Fragment>
            );
          }
        })
      );
      setComponents(datas);
    }
  };

  useEffect(() => {
    if (state && stages) {
      getEnrollment();
    }
  }, [state, stages]);

  const createColumns = (formData, data) =>
    formData?.map((section) => {
      const sectionData = data?.filter((item) => item?.programStage === section?.stageId);
      const sectionValues = sectionData?.flatMap((item) =>
        item?.dataValues?.reduce((acc, curr) => {
          acc[curr?.dataElement] = formatDisplayValue(curr?.value);
          return acc;
        }, {})
      );

      const sectionDataElementIds = section?.elements?.map((dataElement) => dataElement?.id);
      const sectionValuesData = sectionValues?.filter((item) => Object.keys(item).some((key) => sectionDataElementIds?.includes(key)));

      return {
        name: section.title,
        programStage: section.programStage,
        columns: section.elements?.map((dataElement) => ({
          title: dataElement.name,
          dataIndex: dataElement.id,
          key: dataElement.id,
          render: (value) => value || "-",
        })),
        data: sectionValuesData,
      };
    }) || [];

  return (
    <>
      {surgeryLink && (
        <Breadcrumb
          separator={<DoubleLeftOutlined />}
          style={{ marginBottom: "1rem" }}
          items={[
            { title: <Link to="/surgeries">Surgeries</Link> },
            { title: <Link to={surgeryLink}>Surgery Details</Link> },
            { title: "Print" },
          ]}
        />
      )}
      <CardItem
        title={
          <Button onClick={handleDownload} icon={<CloudDownloadOutlined />}>
            Download PDF
          </Button>
        }
      >
        {!components || !attributes ? (
          <CircularLoader />
        ) : (
          <div id="page">
            <div className={classes.mainSection}>
              <Section title="SURGERY SUMMARY" primary />
            </div>
            <Table
              columns={tableColumns}
              dataSource={attributes || []}
              pagination={false}
              rowKey={(record) => record.displayName}
              size="small"
              showHeader={false}
              bordered
              className={classes.mainSection}
            />
            {components?.map((component, index) => (
              <Fragment key={index}>{component}</Fragment>
            ))}
          </div>
        )}
      </CardItem>
    </>
  );
};

export default Print;
