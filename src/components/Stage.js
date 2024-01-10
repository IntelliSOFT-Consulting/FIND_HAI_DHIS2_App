import React, { useState, useEffect } from "react";
import { Button, Form } from "antd";
import { createUseStyles } from "react-jss";
import { useNavigate, useParams } from "react-router-dom";
import RepeatForm from "./RepeatForm";
import Section from "./Section";
import UseDataStore from "../hooks/useDataStore";
import useEnrollment from "../hooks/useEnrollment";
import InputItem from "./InputItem";
import useEvents from "../hooks/useEvents";
import { evaluateShowIf, evaluateValidations, formatAttributes, formatDataValues } from "../lib/helpers";
import {
  getSectionMappings,
  getSectionEvents,
  getNonRepeatingEvents,
  getRepeatingEvents,
  getUpdatedEvents,
  getRepeatingValues,
} from "../lib/stageHelpers";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";

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
  buttonsContainer: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100% !important",
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
  },
  fullWidth: {
    width: "100% !important",
    marginBottom: "1rem",
    "& > div": {
      width: "100% !important",
    },
  },
  add: {
    padding: "1rem",
  },
});

export default function Stage({
  dataValues,
  setDataValues,
  stageForm,
  surgeryLink,
  enrollmentData,
  getEnrollment,
  eventId,
  stageEvents,
}) {
  const [formValues, setFormValues] = useState(null);
  const [error, setError] = useState(null);

  const [form] = Form.useForm();
  const classes = useStyles();

  const navigate = useNavigate();

  const attributes = useSelector((state) => state.attributes);
  const dataElements = useSelector((state) => state.dataElements);

  const { getData, saveData } = UseDataStore();
  const { updateEnrollment } = useEnrollment();

  const { createEvents, deleteEvents } = useEvents();

  const unifyValues = () => {
    const values = form.getFieldsValue();
    const unifiedValues = {};
    Object.keys(values).forEach((key) => {
      if (Array.isArray(values[key])) {
        unifiedValues[key] = values[key]?.map((value) => {
          if (value?.value) {
            return value.value;
          } else {
            return value;
          }
        });
      } else {
        unifiedValues[key] = values[key];
      }
    });

    setFormValues(unifiedValues);
    return unifiedValues;
  };

  const eventsData = enrollmentData?.events?.reduce((acc, curr) => {
    const values = {};
    for (const dataValue of curr?.dataValues) {
      values[dataValue.dataElement] = dataValue.value;
    }
    return {
      ...acc,
      ...values,
    };
  }, {});

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      form.submit();
    } catch (errorInfo) {
      if (errorInfo.errorFields.length > 0) {
        const errorField = document.querySelector(".ant-form-item-has-error");
        errorField.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    }
  };

  const handleFinish = async (values) => {
    try {
      const mappings = await getData("repeatSections", "postOperative");
      const nonRepeatingStages = stageForm.sections.filter((section) => !section.repeatable || section.stageId === "IbB9QEgQU6D");
      const repeatingStages = stageForm.sections.filter((section) => section.repeatable);

      const sectionMappings = getSectionMappings(mappings, eventId);
      const sectionEvents = getSectionEvents(enrollmentData, sectionMappings, eventId);
      const nonRepeatingEvents = getNonRepeatingEvents(sectionEvents, nonRepeatingStages);
      const repeatingEvents = getRepeatingEvents(sectionEvents, repeatingStages);
      const updatedEvents = getUpdatedEvents(nonRepeatingEvents, nonRepeatingStages, values);
      const repeatingValues = getRepeatingValues(values);

      const updatedRepeatingEvents = await Promise.all(
        Object.keys(repeatingValues).flatMap(async (programStageId) => {
          const stageEvents = repeatingEvents.filter((event) => event.programStage === programStageId);

          repeatingValues[programStageId].forEach((value, index) => {
            const stageDataElements = stageForm.sections
              ?.filter((section) => section.stageId === programStageId)
              ?.flatMap((section) => section.dataElements);

            if (stageEvents[index]) {
              stageEvents[index].dataValues = stageDataElements.map((dataElement) => ({
                dataElement: dataElement.id,
                value: value[dataElement.id],
              }));
            } else {
              stageEvents.push({
                programStage: programStageId,
                program: enrollmentData.program,
                enrollment: enrollmentData.enrollment,
                orgUnit: enrollmentData.orgUnit,
                trackedEntityInstance: enrollmentData.trackedEntityInstance,
                eventDate: new Date().toISOString().split("T")[0],
                status: "COMPLETED",
                completedDate: new Date().toISOString().split("T")[0],
                dataValues: stageDataElements.map((dataElement) => ({
                  dataElement: dataElement.id,
                  value: value[dataElement.id],
                })),
              });
            }
          });

          if (stageEvents.length > repeatingValues[programStageId].length) {
            const extras = stageEvents.slice(repeatingValues[programStageId].length);
            await deleteEvents(extras);
          }

          return stageEvents;
        })
      );

      const payload = [...updatedEvents, ...updatedRepeatingEvents].flat()?.map((item) => ({ ...item, status: "COMPLETED" }));

      const response = await createEvents(payload);

      if (response) {
        if (eventId) {
          const newMappings = response?.map((mapping) => {
            return {
              parentEvent: eventId,
              event: mapping,
            };
          });
          await saveData("repeatSections", "postOperative", [...mappings, ...newMappings]);
        }

        if (stageForm?.title?.toLowerCase() === "outcome") {
          await getEnrollment();
          await updateEnrollment(enrollmentData?.enrollment, { ...enrollmentData, status: "COMPLETED" });
        }
        navigate(surgeryLink);
      }
    } catch (errorInfo) {
      setError(errorInfo);
    }
  };

  const showSection = (section, formValues) => {
    const formValuesObject = formValues ? formValues : dataValues;
    if (!formValuesObject) {
      return true;
    }
    if (section.title === "Antimicrobial Susceptibility Testing") {
      const specType = "ifncEH9ZQwB";
      const specTypeValues = formValuesObject ? formValuesObject[specType] : [];

      const values = specTypeValues?.flatMap((item) => (item ? Object.values(item) : []));
      const noGrowth = values?.some((value) => value === "No growth");
      return !noGrowth;
    }

    if (section.title === "Symptoms" || section.sectionId === "blNc7ePFTPu") {
      return formValuesObject["kKbAdaCCCM7"] === "true" || formValuesObject["kKbAdaCCCM7"] === true;
    }

    if (section.title === "Symptoms" || section.sectionId === "blNc7ePFTPu" || section.title === "INFECTION INFORMATION") {
      return formValuesObject["fkxHVloTLwR"] === "true" || formValuesObject["fkxHVloTLwR"] === true;
    }

    return true;
  };

  return (
    <Form
      className={classes.form}
      form={form}
      layout="vertical"
      onValuesChange={(changedValues, allValues) => {
        unifyValues();
      }}
      initialValues={dataValues}
      onFinish={handleFinish}
      autoComplete="off"
    >
      {stageForm.sections.map((section, index) => {
        const values = formValues || dataValues;
        if (!showSection(section, values)) {
          const sectionValues = values[section.stageId];
          if (sectionValues) {
            const newFormValues = { ...values };
            delete newFormValues[section.stageId];
            form.setFieldsValue(newFormValues);
            setFormValues(newFormValues);
          }
          return null;
        }
        if (section.repeatable && section.stageId !== "IbB9QEgQU6D") {
          return (
            <>
              <div className={classes.fullWidth}>
                <Section key={section.sectionId} title={section.title} />
              </div>
              <RepeatForm
                key={section.sectionId}
                Form={Form}
                form={form}
                section={section}
                formValues={formValues || dataValues}
                setDataValues={setDataValues}
                eventsData={eventsData}
              />
            </>
          );
        } else {
          return (
            <>
              <div className={classes.fullWidth}>
                <Section key={section.sectionId} title={section.title} />
              </div>
              {section.dataElements?.map((dataElement) => {
                const shouldShow = !dataElement.showif || evaluateShowIf(dataElement.showif, formValues || dataValues);

                if (!shouldShow) {
                  form.setFieldValue(dataElement.id, null);
                }
                return (
                  shouldShow && (
                    <Form.Item
                      key={dataElement.id}
                      label={dataElement.name}
                      name={dataElement.id}
                      rules={[
                        {
                          required: dataElement.required,
                          message: `${dataElement.name} is required.`,
                        },
                        ...evaluateValidations(
                          dataElement.validator,
                          dataElement.valueType,
                          {
                            ...formatAttributes(attributes),
                            ...formatDataValues(stageEvents),
                            ...(formValues || dataValues),
                          },
                          [...dataElements, ...attributes]
                        ),
                      ]}
                      className={section.dataElements.length === 1 ? classes.fullWidth : null}
                    >
                      <InputItem
                        type={dataElement.optionSet ? "SELECT" : dataElement.valueType}
                        options={dataElement.optionSet?.options?.map((option) => ({
                          label: option.displayName,
                          value: option.code,
                        }))}
                        placeholder={`Enter ${dataElement.name}`}
                        name={dataElement.id}
                        {...(dataElement.disablefuturedate
                          ? {
                              disabledDate: (current) => {
                                return current && current > dayjs().endOf("day");
                              },
                            }
                          : {})}
                      />
                    </Form.Item>
                  )
                );
              })}
            </>
          );
        }
      })}
      <Form.Item className={classes.buttonsContainer}>
        <Button className={classes.cancelButton} htmlType="button" onClick={() => navigate(surgeryLink)}>
          Cancel
        </Button>
        <Button className={classes.submitButton} htmlType="button" onClick={handleSubmit}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
