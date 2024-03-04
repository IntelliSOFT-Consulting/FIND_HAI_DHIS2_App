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
import { useParams } from "react-router-dom";
import Symptoms from "./Symptoms";
import { disableDuplicateProphylaxis, evaluateRiskFactors } from "../lib/validations";

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
  },
});

const RenderFormSection = ({ section, attributes, dataElements, stageEvents, eventId, getEnrollment }) => {
  const [saving, setSaving] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const [stageValues, setStageValues] = useState([]);

  const classes = useStyles();

  const { program } = useSelector((state) => state.forms);
  const { trackedEntityInstance, enrollment } = useParams();
  const { id } = useSelector((state) => state.orgUnit);

  const [form] = Form.useForm();

  const { createEvents, deleteEvents } = useEvents();

  const isRepeatable =
    section?.stage?.repeatable &&
    !section?.stage?.sections?.some((section) => section?.elements?.some((element) => element?.multiple));

  const sectionEvents = stageEvents?.filter((event) => event?.programStage === section?.stage?.stageId);

  useEffect(() => {
    if (stageEvents?.length > 0) {
      const formatted = formatDefaultValues(sectionEvents, section?.stage, isRepeatable);
      setInitialValues(formatted);
      setStageValues(formatted);
    }
  }, [stageEvents]);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
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

      const response = await createEvents(createEventsPayload);
      if (response) {
        message.success("Form submitted successfully");
        await getEnrollment();
        setSaving(false);
      }
    } catch (error) {
      message.error("Form submission failed");
      setSaving(false);
    }
  };

  const changeHandler = () => {
    const values = form.getFieldsValue();
    setStageValues(values);
  };

  return (
    <>
      {initialValues &&
        (section?.stage?.title === "Symptoms" ? (
          <Symptoms
            stage={section}
            events={stageEvents}
            program={program}
            orgUnit={id}
            trackedEntityInstance={trackedEntityInstance}
            event={eventId}
          />
        ) : (
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
                    <div className={isRepeatable ? classes.formList : ""}>
                      {fields.map((field, index) => {
                        let sectionvalues = stageValues[section?.stage?.stageId]?.[field.key];

                        return (
                          <div key={field.key} className={classes.add}>
                            {section?.stage?.sections?.map((sectionItem) => {
                              return (
                                <>
                                  {sectionItem.sectionName !== section?.stage?.title && sectionItem.sectionName?.trim() && (
                                    <Divider orientation="left">{toTitleCase(sectionItem.sectionName)}</Divider>
                                  )}
                                  {sectionItem.elements?.map((dataElement) => {
                                    const shouldShow =
                                      !dataElement.showif || evaluateShowIf(dataElement.showif, sectionvalues || {});

                                    if (!shouldShow) {
                                      form.setFieldValue([section?.stage?.stageId, field.key, dataElement.id], null);
                                    }

                                    return (
                                      shouldShow && (
                                        <Form.Item
                                          key={dataElement.id}
                                          label={dataElement.name}
                                          name={[field.name, dataElement.id]}
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
                                          ]}
                                          className={sectionItem.elements.length === 1 ? classes.fullWidth : null}
                                          hidden={dataElement.name === "Symptom presence"}
                                        >
                                          <InputItem
                                            type={dataElement.options ? "SELECT" : dataElement.valueType}
                                            options={dataElement?.options}
                                            placeholder={`Enter ${dataElement.name}`}
                                            onChange={changeHandler}
                                            name={[field.name, dataElement.id]}
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
                                </>
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
                          }}
                          style={{ width: "60%" }}
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
        ))}
    </>
  );
};

export default RenderFormSection;
