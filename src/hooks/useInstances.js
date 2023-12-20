import { useDataEngine } from "@dhis2/app-runtime";
import { useParams } from "react-router-dom";
import { setProgramValues } from "../redux/actions";
import { notification } from "antd";
import { useDispatch, useSelector } from "react-redux";

export default function UseInstances() {
  const engine = useDataEngine();
  const { trackedEntityInstance, enrollment } = useParams();

  const { registration } = useSelector((state) => state.forms);
  const dispatch = useDispatch();

  const findPatientInstance = async (attribute, value, ou, program) => {
    try {
      const params = {};
      if (attribute && value) {
        params.filter = `${attribute}:EQ:${value}`;
      }

      const { trackedEntityInstances } = await engine.query({
        trackedEntityInstances: {
          resource: "trackedEntityInstances.json",
          params: {
            ou,
            program,
            ouMode: "ACCESSIBLE",
            fields: "trackedEntityInstance,trackedEntityType,attributes[attribute,value,udisplayName],enrollments[*]",
            ...params,
          },
        },
      });
      return trackedEntityInstances?.trackedEntityInstances[0];
    } catch (error) {
      console.log("error", error);
    }
  };

  const getEnrollmentData = async (tei = null, isNew = false) => {
    try {
      const { events } = await engine.query({
        events: {
          resource: `trackedEntityInstances/${tei || trackedEntityInstance}`,
          params: {
            fields: "enrollments[*]",
          },
        },
      });

      if (isNew) {
        return events?.enrollments[0];
      }
      const userEnrollments = events?.enrollments?.find((enroll) => enroll.enrollment === enrollment);

      return userEnrollments;
    } catch (error) {
      console.log("error", error);
    }
  };

  const getInstanceValues = async () => {
    try {
      const { trackedEntityInstances } = await engine.query({
        trackedEntityInstances: {
          resource: "trackedEntityInstances",
          id: instanceId,
          params: {
            program: program?.id,
            ou: organisationUnit,
            fields: "*",
          },
        },
      });
      const attributes = trackedEntityInstances?.attributes;

      const eventsData = trackedEntityInstances?.enrollments[0]?.events;

      const datas = {};

      attributes?.forEach((attribute) => {
        datas[attribute.attribute] = attribute.value;
      });

      eventsData?.forEach((event) => {
        event?.dataValues?.forEach((dataValue) => {
          datas[dataValue.dataElement] = dataValue.value;
        });
      });

      dispatch(setProgramValues(datas));
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Something went wrong",
      });
    }
  };

  const getProgramValues = async (programId, programStage, orgUnit) => {
    try {
      const { events } = await engine.query({
        events: {
          resource: `trackedEntityInstances/query.json?ou=${orgUnit}&program=${programId}&programStage=${programStage}&pageSize=1000&order=created:desc`,
        },
      });

      return { events };
    } catch (error) {
      return { error };
    }
  };

  const searchPatient = async (programId, key, value) => {
    try {
      const { tei } = await engine.query({
        tei: {
          resource: `trackedEntityInstances`,
          params: {
            fields: ["attributes[*]", "enrollments[*]"],
            ouMode: "ALL",
            program: programId,
            filter: `${key}:eq:${value}`,
          },
        },
      });

      const enrolled = tei?.trackedEntityInstances?.filter((item) => item.enrollments?.length);
      return enrolled?.map((item) => ({
        ...item.enrollments[0],
        attributes: item.attributes,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const getSurgeries = async (query = "", program) => {
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
          program,
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
      return results?.flatMap((result) => result);
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

    return trackedEntityInstances?.flatMap((instance) => {
      return instance?.enrollments?.map((enrollment) => {
        return {
          ...enrollment,
          trackedEntityType: instance?.trackedEntityType,
          trackedEntityInstance: instance?.trackedEntityInstance,
        };
      });
    });
  };

  return { findPatientInstance, getEnrollmentData, getInstanceValues, getProgramValues, searchPatient, getSurgeries };
}
