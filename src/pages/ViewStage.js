import React, { useEffect, useState } from "react";
import { Breadcrumb, Spin, Table } from "antd";
import { Link, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { DoubleLeftOutlined } from "@ant-design/icons";
import Section from "../components/Section";
import CardItem from "../components/CardItem";
import useGetInstances from "../hooks/useInstances";
import UseDataStore from "../hooks/useDataStore";
import { formatDisplayValue } from "../lib/mapValues";

const parseQueryString = (location) => {
  const queryString = location.search.substring(1);
  const params = queryString.split("&");
  return params.reduce((paramObject, param) => {
    const [key, value] = param.split("=");
    paramObject[key] = value;
    return paramObject;
  }, {});
};

const formSections = (stageForm) => {
  return stageForm?.sections
    ?.map((section) => {
      const { stage } = section;
      return stage.sections;
    })
    .flat(2);
};

const ViewStage = () => {
  const [columns, setColumns] = useState(null);
  const [mappings, setMappings] = useState(null);
  const { stages } = useSelector((state) => state.forms);
  const { getEnrollmentData } = useGetInstances();
  const { getData } = UseDataStore();
  const { stage, enrollment, trackedEntityInstance } = useParams();
  const surgeryLink = `/surgery/${trackedEntityInstance}/${enrollment}`;
  const location = useLocation();
  const queryParams = parseQueryString(location);
  const stageForm = stages?.find((item) => item.stageId === stage);

  const fetchMappings = async () => {
    const response = await getData("repeatSections", "postOperative");
    setMappings(response);
  };

  const getStageEvents = (datas, stageId) => {
    const { events } = datas;

    const filtered = events
      .filter((event) => {
        if (queryParams?.event) {
          const eventMappings = mappings?.filter((mapping) => mapping?.parentEvent === queryParams?.event);
          return eventMappings?.some((mapping) => mapping?.event === event.event) && stageId === event.programStage;
        }
        return stageId === event.programStage;
      })
      .sort((a, b) => new Date(a.created) - new Date(b.created));

    const dataElements = formSections(stageForm)
      ?.map((section) => {
        return section.elements;
      })
      .flat(2);

    const dataElementIds = dataElements?.map((element) => element.id);
    return filtered
      .map((event) => {
        return event.dataValues.reduce((acc, cur) => {
          if (dataElementIds?.includes(cur.dataElement)) {
            acc[cur.dataElement] = formatDisplayValue(cur.value) || "-";
          }
          return acc;
        }, {});
      })
      .flat(1);
  };

  const createTables = (data) => {
    return stageForm.sections.flatMap((item) => {
      const { stage: sectionStage } = item;
      return sectionStage.sections.map((section) => {
        const columns = section.elements.map((element) => ({
          title: element.name,
          dataIndex: element.id,
          key: element.id,
        }));

        const stageEvents = getStageEvents(data, sectionStage.stageId);

        return {
          title: section.sectionName,
          columns,
          dataSource: stageEvents,
        };
      });
    });
  };

  const getEnrollment = async () => {
    const data = await getEnrollmentData();
    if (data?.status) {
      if (stageForm) {
        setColumns(createTables(data));
      }
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  useEffect(() => {
    if (stageForm && mappings) {
      getEnrollment();
    }
  }, [stageForm, location, mappings]);

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
        <Spin spinning={!columns} tip="Loading...">
          {columns?.map((column, index) => (
            <React.Fragment key={index}>
              <Section title={column?.title} />
              <Table
                columns={column?.columns || []}
                dataSource={column?.dataSource || []}
                pagination={false}
                bordered
                style={{ marginBottom: "1rem" }}
                size="small"
              />
            </React.Fragment>
          ))}
        </Spin>
      </CardItem>
    </>
  );
};

export default ViewStage;
