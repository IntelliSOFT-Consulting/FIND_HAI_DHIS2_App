import React, { useEffect, useState } from "react";
import { Table, Breadcrumb } from "antd";
import { Link, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { DoubleLeftOutlined } from "@ant-design/icons";
import { createUseStyles } from "react-jss";
import { CircularLoader } from "@dhis2/ui";
import Section from "../components/Section";
import CardItem from "../components/CardItem";
import UseGetEnrollmentsData from "../hooks/UseGetEnrollmentsData";
import UseViewData from "../hooks/UseViewData";
import UseDataStore from "../hooks/useDataStore";
import { formatDisplayValue } from "../lib/mapValues";

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

const ViewStage = () => {
  const [columns, setColumns] = useState(null);
  const { stages } = useSelector((state) => state.forms);
  const { getEnrollmentData } = UseGetEnrollmentsData();
  const { dataViewModel, setEnrollment, setEvents, events } = UseViewData();
  const { getData } = UseDataStore();
  const { stage, enrollment, trackedEntityInstance } = useParams();
  const surgeryLink = `/surgery/${trackedEntityInstance}/${enrollment}`;
  const classes = useStyles();
  const location = useLocation();

  const parseQueryString = () => {
    const queryString = location.search.substring(1);
    const params = queryString.split("&");
    return params.reduce((paramObject, param) => {
      const [key, value] = param.split("=");
      paramObject[key] = value;
      return paramObject;
    }, {});
  };

  const queryParams = parseQueryString();

  const stageForm = stages?.find((item) => item.stageId === stage);

  const getEnrollment = async () => {
    const data = await getEnrollmentData();
    if (data?.status) {
      const stageValues = await filterAndSortEvents(data.events);
      if (stageValues && stageForm) {
        setColumns(createColumns(stageForm, stageValues));
      }
    }
  };

  const filterAndSortEvents = async (events) => {
    const mappings = await getData("repeatSections", "postOperative");
    const repeatIds = stageForm?.children?.map((child) => child?.stageId);
    return events
      ?.filter((event) => {
        if (queryParams.event) {
          const repeatEvents = mappings
            .filter((mapping) => mapping?.parentEvent === queryParams.event)
            ?.map((mapping) => mapping?.event);
          return event.event === queryParams.event || repeatEvents?.includes(event.event);
        }
        return event.programStage === stage || repeatIds?.includes(event.programStage);
      })
      ?.sort((a, b) => a.created - b.created);
  };

  useEffect(() => {
    if (stageForm) {
      getEnrollment();
    }
  }, [stageForm, location]);

  const createColumns = (formData, data) => {
    return [...formData?.sections, ...(formData?.children?.flatMap((child) => child?.sections) || [])]?.map((section) => {
      const sectionData = data?.filter((item) => item?.programStage === (section?.stageId || section.programStage));
      const sectionValues = sectionData?.flatMap((item) =>
        item?.dataValues?.reduce((acc, curr) => {
          acc[curr?.dataElement] = formatDisplayValue(curr?.value);
          return acc;
        }, {})
      );

      const sectionDataElementIds = section?.dataElements?.map((dataElement) => dataElement?.id);
      const sectionValuesData = sectionValues?.filter((item) => {
        const sectionKeys = Object.keys(item);
        return sectionKeys?.some((key) => sectionDataElementIds?.includes(key));
      });

      return {
        name: section.title,
        programStage: section.programStage,
        columns: section.dataElements?.map((dataElement) => ({
          title: dataElement.name,
          dataIndex: dataElement.id,
          key: dataElement.id,
          render: (value) => value || "-",
        })),
        data: sectionValuesData,
      };
    });
  };

  return (
    <>
      {surgeryLink && (
        <Breadcrumb
          separator={<DoubleLeftOutlined />}
          style={{ marginBottom: "1rem" }}
          items={[
            { title: <Link to="/surgeries">Surgeries</Link> },
            { title: <Link to={surgeryLink}>Surgery Details</Link> },
            { title: stageForm?.title },
          ]}
        />
      )}
      <CardItem title={stageForm?.title}>
        {!columns ? (
          <CircularLoader />
        ) : (
          columns?.map((column, index) => (
            <React.Fragment key={index}>
              <Section title={column?.name} />
              <Table
                columns={column?.columns || []}
                dataSource={column?.data || []}
                pagination={false}
                bordered
                style={{ marginBottom: "1rem" }}
                size="small"
              />
            </React.Fragment>
          ))
        )}
      </CardItem>
    </>
  );
};

export default ViewStage;
