import InputItem from "./InputItem";
import React, { useEffect, useState } from "react";
import { Form, Button, Divider, message } from "antd";
import { createUseStyles } from "react-jss";
import { evaluateShowIf, formatAttributes, formatDataValues, toTitleCase } from "../lib/helpers";
import { useSelector } from "react-redux";
import { evaluateValidations } from "../lib/helpers";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import Accordion from "./Accordion";
import { formatDefaultValues, formatSubmissions } from "../lib/formFormatter";
import useEvents from "../hooks/useEvents";
import { useParams, useNavigate } from "react-router-dom";
import Symptoms from "./Symptoms";
import { disableDuplicateProphylaxis, disableNoneOption, evaluateRiskFactors } from "../lib/validations";
import useInstances from "../hooks/useInstances";
import * as constants from "../contants/ids";
import { DeleteTwoTone } from "@ant-design/icons";
import UseDataStore from "../hooks/useDataStore";
import { get } from "lodash";

dayjs.extend(weekday);
dayjs.extend(localeData);

const useStyles = createUseStyles({
  form: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    padding: "1rem",
    "& > div": {
      width: "48%",
    },
  },
  submitButton: {
    margin: "1rem",
    backgroundColor: "#026C26 !important",
    color: "white",
    borderColor: "#026C26 !important",
    "&:hover": {
      backgroundColor: "#026C26 !important",
      color: "white !important",
    },
  },
  cancelButton: {
    margin: "1rem",
    backgroundColor: "#B10606",
    color: "white",
    borderColor: "#B10606 !important",
    "&:hover": {
      backgroundColor: "#B10606 !important",
      color: "white !important",
    },
  },
  formList: {
    margin: "1rem",
    border: "1px dashed #ccc",
    padding: "1rem",
    borderRadius: "5px",
    "& >div:not(:first-child)": {
      marginTop: "1rem",
      borderTop: "1px solid #ccc",
    },
  },
  fullWidth: {
    width: "100% !important",
    "& > div": {
      width: "100% !important",
    },
  },
  add: {
    padding: "1rem",
    position: "relative",
  },
  relative: {
    position: "relative",
  },
  remove: {
    position: "absolute",
    top: 0,
    right: 0,
    border: "1px solid #f81d22",
    borderRadius: "5px",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: "#ffeeeb",
    borderTop: "none",
  },
});

const RenderFormSection = ({
  section,
  attributes,
  dataElements,
  stageEvents,
  eventId,
  getEnrollment,
  sampleId,
  signOfInfection,
  cultureFindings,
  surgeryLink,
}) => {
  const [saving, setSaving] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const [stageValues, setStageValues] = useState([]);

  const classes = useStyles();
  const navigate = useNavigate();

  const { getData, saveData } = UseDataStore();

  const { program } = useSelector((state) => state.forms);
  const { trackedEntityInstance, enrollment } = useParams();
  const { id } = useSelector((state) => state.orgUnit);

  const [form] = Form.useForm();

  const { createEvents, deleteEvents } = useEvents();

  const { getTrackedEntityInstance, saveTrackedEntityInstance } = useInstances();

  const isRepeatable =
    section?.stage?.repeatable &&
    !section?.stage?.sections?.some((section) => section?.elements?.some((element) => element?.multiple)) &&
    ![constants.stages.ssi, constants.stages.postOperative].includes(section?.stage?.stageId);

  const sectionEvents = stageEvents?.filter((event) => event?.programStage === section?.stage?.stageId);

  useEffect(() => {
    if (stageEvents?.length > 0) {
      const formatted = formatDefaultValues(sectionEvents, section?.stage, isRepeatable);
      setInitialValues(formatted);
      setStageValues(formatted);
    } else if (section && stageEvents?.length === 0) {
      setInitialValues({
        [section?.stage?.stageId]: [{}],
      });
    }
  }, [stageEvents]);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const dateOfEventId = constants.attributes.dateOfEvent;
      const signOfInfectionId = constants.dataElements.signOfInfection;
      const infectionPresentAtSurgeryId = constants.dataElements.infectionPresentAtSurgery;
      const dateOfWoundCheckupId = constants.dataElements.dateOfWoundCheckup;

      let createEventsPayload = formatSubmissions(values, section?.stage, sectionEvents, {
        enrollment,
        orgUnit: id,
        program,
        trackedEntityInstance,
      });

      if (sectionEvents?.length > createEventsPayload?.length) {
        const eventsToDelete = sectionEvents.slice(createEventsPayload.length);
        createEventsPayload = createEventsPayload.slice(0, sectionEvents.length);

        await deleteEvents(eventsToDelete);
      }

      if (Object.values(values)?.[0]?.[0]?.[signOfInfectionId] === false) {
        const symptomEvents = stageEvents.filter((event) => event.programStage === constants.stages.symptoms);

        if (symptomEvents) {
          await deleteEvents(symptomEvents);
        }
      }

      const response = await createEvents(createEventsPayload);

      if (response) {
        if (eventId) {
          const storeData = await getData("repeatSections", "postOperative");
          const newEvents = response.map((item) => {
            return {
              event: item,
              programStage: section?.stage?.stageId,
              parentEvent: eventId,
            };
          });

          const newEventsData = storeData.concat(newEvents);
          const newEventsDataUnique = newEventsData.filter(
            (item, index, self) => index === self.findIndex((t) => t.event === item.event)
          );
          await saveData("repeatSections", "postOperative", newEventsDataUnique);
        }

        const instance = await getTrackedEntityInstance(trackedEntityInstance);
        message.success("Form submitted successfully");
        await getEnrollment();

        const events = instance?.enrollments?.flatMap((enrollment) => {
          return enrollment?.events;
        });

        const posOperativeEvents = events?.filter((event) => event?.programStage === constants.stages.postOperative);

        const infectionPresentAtSurgery = posOperativeEvents?.filter((item) => {
          return (
            item?.dataValues?.find((dataValue) => dataValue?.dataElement === infectionPresentAtSurgeryId)?.value === "false" &&
            item?.dataValues?.find((dataValue) => dataValue?.dataElement === signOfInfectionId)?.value === "true" &&
            item?.dataValues?.find((dataValue) => dataValue?.dataElement === dateOfWoundCheckupId)?.value
          );
        });

        if (infectionPresentAtSurgery?.length > 0) {
          const dataValues = infectionPresentAtSurgery?.map((event) => event.dataValues).flat(Infinity);
          const dateOfWoundCheckup = dataValues
            ?.filter((val) => val.dataElement === dateOfWoundCheckupId)
            .map((val) => new Date(val.value));

          const earliestDateOfWoundCheckup = dateOfWoundCheckup?.sort((a, b) => a - b)[0];

          if (earliestDateOfWoundCheckup) {
            const updatedInstance = {
              ...instance,
              attributes: [
                ...instance?.attributes,
                {
                  attribute: dateOfEventId,
                  value: earliestDateOfWoundCheckup,
                },
              ],
            };

            await saveTrackedEntityInstance(trackedEntityInstance, updatedInstance);
          }
        }
        if (section?.stage?.stageId === constants.stages.outcome) {
          const completedInstance = {
            ...instance,
            enrollments: instance?.enrollments.map((enrollment) => {
              return {
                ...enrollment,
                status: "COMPLETED",
                events: enrollment.events?.map((event) => {
                  return {
                    ...event,
                    status: "COMPLETED",
                  };
                }),
              };
            }),
          };
          await saveTrackedEntityInstance(trackedEntityInstance, completedInstance);
          navigate(surgeryLink);
        }

        setSaving(false);
      }
    } catch (error) {
      console.log("error", error);
      message.error("Form submission failed");
      setSaving(false);
    }
  };

  const changeHandler = () => {
    const values = form.getFieldsValue();
    setStageValues(values);
  };

  const noGrowth =
    section?.stage?.stageId !== constants.stages.ast ||
    (cultureFindings?.toLowerCase() !== "no growth" && section?.stage?.stageId === constants.stages.ast);

  return (
    <>
      {initialValues &&
        (section?.stage?.title === "Symptoms" && signOfInfection ? (
          <Symptoms
            stage={section}
            events={stageEvents}
            program={program}
            orgUnit={id}
            trackedEntityInstance={trackedEntityInstance}
            event={eventId}
          />
        ) : (
          section?.stage?.title !== "Symptoms" &&
          noGrowth && (
            <Form
              className={`${classes.form} ${classes.fullWidth}`}
              form={form}
              layout="vertical"
              initialValues={initialValues || {}}
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Accordion title={toTitleCase(section?.stage?.title)} key={section.id} open={true}>
                <Form.List name={section?.stage?.stageId}>
                  {(fields, { add, remove }) => {
                    return (
                      <div className={isRepeatable ? classes.formList : classes.relative}>
                        {fields.map(({ name, key, ...restField }) => {
                          let sectionvalues = stageValues[section?.stage?.stageId]?.[key];

                          return (
                            <div key={name} className={classes.add}>
                              {name > 0 && (
                                <Button
                                  type="link"
                                  className={classes.remove}
                                  onClick={() => remove(name)}
                                  icon={<DeleteTwoTone twoToneColor="#f81d22" />}
                                  danger
                                />
                              )}
                              {section?.stage?.sections?.map((sectionItem) => {
                                const showInfectionInfo =
                                  constants.sections.infectionInformation !== sectionItem.id ||
                                  (constants.sections.infectionInformation === sectionItem.id &&
                                    sectionvalues?.[constants.dataElements.signOfInfection]);
                                return (
                                  showInfectionInfo && (
                                    <div key={sectionItem.id}>
                                      {sectionItem.sectionName !== section?.stage?.title && sectionItem.sectionName?.trim() && (
                                        <Divider orientation="left">{toTitleCase(sectionItem.sectionName)}</Divider>
                                      )}
                                      {sectionItem.elements?.map((dataElement) => {
                                        const shouldShow =
                                          !dataElement.showif || evaluateShowIf(dataElement.showif, sectionvalues || {});

                                        const isSampleId =
                                          section?.stage?.stageId === constants.stages.ast &&
                                          sampleId &&
                                          dataElement.id === constants.dataElements.sampleId;

                                        return (
                                          shouldShow && (
                                            <Form.Item
                                              {...restField}
                                              shouldUpdate={(prevValues, curValues) => {
                                                const listName = section?.stage?.stageId;

                                                if (
                                                  isSampleId &&
                                                  prevValues?.[listName]?.length < curValues?.[listName]?.length
                                                ) {
                                                  form.setFieldValue(
                                                    [listName, curValues[listName].length - 1, dataElement.id],
                                                    sampleId
                                                  );
                                                }
                                              }}
                                              key={dataElement.id}
                                              label={dataElement.name}
                                              name={[name, dataElement.id]}
                                              rules={[
                                                {
                                                  required: dataElement.required && shouldShow,
                                                  message: `${dataElement.name} is required.`,
                                                },
                                                ...evaluateValidations(
                                                  dataElement.validator,
                                                  dataElement,
                                                  {
                                                    ...formatAttributes(attributes),
                                                    ...formatDataValues(stageEvents),
                                                    ...(sectionvalues || {}),
                                                  },
                                                  [...dataElements, ...attributes]
                                                ),
                                                ...evaluateRiskFactors(
                                                  dataElement?.name?.toLowerCase() === "risk factors",
                                                  attributes
                                                ),
                                                ...disableDuplicateProphylaxis(dataElement),
                                                ...disableNoneOption(dataElement),
                                              ]}
                                              className={sectionItem.elements.length === 1 ? classes.fullWidth : null}
                                              hidden={dataElement.name === "Symptom presence" || !shouldShow}
                                            >
                                              <InputItem
                                                type={dataElement.options ? "SELECT" : dataElement.valueType}
                                                options={dataElement?.options}
                                                placeholder={`Enter ${dataElement.name}`}
                                                onChange={changeHandler}
                                                name={[name, dataElement.id]}
                                                {...(!shouldShow ? { value: null } : {})}
                                                // {...(isSampleId ? { defaultValue: sampleId } : {})}
                                                {...(dataElement.disablefuturedate
                                                  ? {
                                                      disabledDate: (current) => {
                                                        return current && current > dayjs().endOf("day");
                                                      },
                                                    }
                                                  : {})}
                                                {...(dataElement.multiple ? { mode: "multiple" } : {})}
                                              />
                                            </Form.Item>
                                          )
                                        );
                                      })}
                                    </div>
                                  )
                                );
                              })}
                            </div>
                          );
                        })}
                        {isRepeatable && (
                          <Button
                            type="dashed"
                            onClick={() => {
                              add();
                              if (fields.length === 0 && sampleId) {
                                form.setFieldValue([section?.stage?.stageId, 0, constants.dataElements.sampleId], sampleId);
                              }
                            }}
                            style={{ width: "60%" }}
                            disabled={JSON.stringify(form.getFieldsValue()).includes("None given")}
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    );
                  }}
                </Form.List>
                <div className={classes.buttonsContainer}>
                  <Button loading={saving} className={classes.submitButton} htmlType="submit">
                    Save
                  </Button>
                </div>
              </Accordion>
            </Form>
          )
        ))}
    </>
  );
};

export default RenderFormSection;
