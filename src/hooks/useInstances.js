import { useDataEngine } from "@dhis2/app-runtime";
import { useParams } from "react-router-dom";
import { setProgramValues } from "../redux/actions";
import { message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import UseEnrollment from "./useEnrollment";
import moment from "moment";

export default function UseInstances() {
  const engine = useDataEngine();
  const { trackedEntityInstance, enrollment } = useParams();

  const { updateEnrollment } = UseEnrollment();

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
            fields: "trackedEntityInstance,trackedEntityType,attributes[attribute,value,name,displayName],enrollments[*]",
            ...params,
          },
        },
      });
      return trackedEntityInstances?.trackedEntityInstances[0];
    } catch (error) {
      message.error("Error finding patient");
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
      const userEnrollment = events?.enrollments?.find((enroll) => enroll.enrollment === enrollment);

      const dateOfSurgery = userEnrollment?.attributes?.find((attr) => attr.displayName === "Date of Surgery");

      const today = moment().format("YYYY-MM-DD");
      const isDateOfSurgeryValid = moment(dateOfSurgery?.value).isSameOrBefore(today);

      if (
        moment(dateOfSurgery?.value).format("YYYY-MM-DD") !== moment(userEnrollment?.enrollmentDate).format("YYYY-MM-DD") &&
        isDateOfSurgeryValid
      ) {
        userEnrollment.enrollmentDate = dateOfSurgery?.value;

        await updateEnrollment(userEnrollment.enrollment, {
          ...userEnrollment,
          enrollmentDate: dateOfSurgery?.value,
        });
      }

      return userEnrollment;
    } catch (error) {
      message.error("Error getting enrollment data");
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
      message.error("Error getting instance values");
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
      message.error("Error getting program values");
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
      message.error("Error searching patient");
    }
  };

  const getSurgeries = async (query = "", program, currentPage = 1, pageSize = 12) => {
    let startDate;
    let endDate;
    if (query?.includes("..")) {
      const dates = query?.split("..");
      startDate = dates[0];
      endDate = dates[1];
      query = "";
    }
    const dataElementIds = registration?.flatMap((section) => {
      return section?.dataElements?.filter((dataElement) => {
        return dataElement?.name === "Secondary ID" || dataElement?.name === "Patient ID";
      });
    });

    query = query?.trim();

    const options = {
      events: {
        resource: `tracker/trackedEntities`,
        params: {
          fields: ["trackedEntityInstance", "trackedEntityType", "attributes[attribute,value]", "enrollments[*]"],
          order: "created:desc",
          ouMode: "ALL",
          program,
          pageSize,
          page: currentPage,
          totalPages: true,
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

          const trackedEntityInstances = events?.instances;

          const enrollments = trackedEntityInstances?.flatMap((instance) => {
            return instance?.enrollments?.map((enrollment) => {
              return {
                ...enrollment,
                trackedEntityType: instance?.trackedEntityType,
                // trackedEntity: instance?.trackedEntity,
              };
            });
          });
          return enrollments?.filter(
            (enrollment, index, self) =>
              index === self.findIndex((t) => t.trackedEntity === enrollment.trackedEntity)
          );
        })
      );
      return {
        page: results?.page,
        pageCount: results?.pageCount,
        total: results?.total,
        results: results?.flatMap((result) => result),
      };
    }

    if (startDate && endDate) {
      const dateOfSurgeryDataElement = registration?.flatMap((section) => {
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
    const trackedEntityInstances = events?.instances;

    return {
      page: events?.page,
      pageCount: events?.pageCount,
      total: events?.total,
      results: trackedEntityInstances?.flatMap((instance) => {
        return instance?.enrollments?.map((enrollment) => {
          return {
            ...enrollment,
            trackedEntityType: instance?.trackedEntityType,
            // trackedEntity: instance?.trackedEntity,
          };
        });
      }),
    };
  };

  const getTrackedEntityInstance = async (tei) => {
    try {
      const { trackedEntityInstances } = await engine.query({
        trackedEntityInstances: {
          resource: `trackedEntityInstances/${tei}`,
          params: {
            fields: "*",
          },
        },
      });

      return trackedEntityInstances;
    } catch (error) {
      message.error("Error getting tracked entity instance");
    }
  };

  const saveTrackedEntityInstance = async (tei, data) => {
    try {
      const { response } = await engine.mutate({
        resource: `trackedEntityInstances/${tei}`,
        type: "update",
        data: data,
      });

      return response;
    } catch (error) {
      message.error("Error saving tracked entity instance");
    }
  };

  return {
    findPatientInstance,
    getEnrollmentData,
    getInstanceValues,
    getProgramValues,
    searchPatient,
    getSurgeries,
    getTrackedEntityInstance,
    saveTrackedEntityInstance,
  };
}
