import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { createUseStyles } from "react-jss";
import { useNavigate, useParams } from "react-router-dom";
import Section from "./Section";
import { PlusCircleOutlined } from "@ant-design/icons";
import UseCreateEvent from "../hooks/useCreateEvent";
import UseGetEvent from "../hooks/useGetEvent";
import UseSaveValue from "../hooks/useSaveValue";
import UseDataStore from "../hooks/useDataStore";
import UseUpdateEnrollment from "../hooks/useUpdateEnrollment";
import useCompleteEvent from "../hooks/useCompleteEvent";
import { formatValue } from "../lib/mapValues";
import { debounce } from "lodash";
import SectionForm from "./SectionForm";
import Alert from "./Alert";
import { useSelector } from "react-redux";
import { evaluateShowIf } from "../lib/helpers";

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

export default function Stage({ forms, setForms, surgeryLink, enrollmentData, getEnrollment }) {
  const [loading, setLoading] = useState(false);
  const [validate, setValidate] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [alert, setAlert] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [_checked, setChecked] = useState(false);

  const { stages } = useSelector((state) => state.forms);

  const { stage: stageId, enrollment } = useParams();

  const classes = useStyles();
  const navigate = useNavigate();
  const { createEvent } = UseCreateEvent();
  const { getEvent } = UseGetEvent();
  const { saveValue } = UseSaveValue();
  const { saveData } = UseDataStore();
  const { updateEnrollment } = UseUpdateEnrollment();
  const { completeAllEvents, activateAllEvents } = useCompleteEvent();

  const stageForm = stages?.find((form) => form.stageId === stageId);

  const formDataElements = stageForm?.sections?.flatMap((section) => {
    return section?.dataElements?.map((dataElement) => ({
      id: dataElement.id,
      name: dataElement.name,
      showif: dataElement.showif,
    }));
  });

  const childrenDataElements = stageForm?.children?.flatMap((child) => {
    return child?.sections?.flatMap((section) => {
      return section?.dataElements?.map((dataElement) => ({
        id: dataElement.id,
        name: dataElement.name,
        showif: dataElement.showif,
      }));
    });
  });

  const dataElements = [...formDataElements, ...childrenDataElements];

  const debouncedSaveValue = debounce(async (value, dataElement, section) => {
    const valueKey = dataElement.id;

    const showif = dataElements?.find((element) => {
      const key = element.showif ? element.showif?.split(":")[0] : null;
      return key?.includes(valueKey);
    });

    if (showif && !evaluateShowIf(showif?.showif, { [valueKey]: value })) {
      await saveValue(section.event, null, showif?.id, section.orgUnit, section.program, section.programStage);
    }

    await saveValue(section.event, value, valueKey, section.orgUnit, section.program, section.programStage);

    await getEnrollment();
  }, 500);

  const completeEnrollment = async () => {
    try {
      const stageEvents = enrollmentData?.events?.filter((event) => event.programStage === stageId);
      const formName = stages?.find((form) => form.stageId === stageId)?.title;
      if (formName?.toLowerCase()?.includes("outcome")) {
        const payload = {
          ...enrollmentData,
          status: "COMPLETED",
          completedDate: new Date().toISOString(),
        };

        await completeAllEvents(stageEvents);
        await updateEnrollment(enrollment, payload);
        navigate(surgeryLink);
      } else {
        await completeAllEvents(stageEvents);
        navigate(surgeryLink);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (validationErrors?.length && isValidating) {
        setAlert("Please fill in all required fields");
        const timer = setTimeout(() => {
          setAlert(null);
        }, 2000);
        setIsValidating(false);
        return () => clearTimeout(timer);
      } else if (validationErrors?.length === 0 && isValidating) {
        setAlert(null);
        completeEnrollment();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [validationErrors, isValidating]);

  const stageElements = stages
    ?.find((stageForm) => stageForm?.stageId === stageId)
    ?.children.flatMap((child) => {
      return child?.sections?.flatMap((section) => {
        return section?.dataElements?.map((dataElement) => {
          return {
            name: dataElement.name,
            id: dataElement.id,
          };
        });
      });
    });

  const organismIsolatedId = stageElements?.find((dataElement) => dataElement.name.includes("Culture findings"))?.id;

  const formatEvents = enrollmentData?.events?.flatMap((item) => {
    const arr = [];
    item.dataValues?.reduce((acc, curr) => {
      if (curr.dataElement === organismIsolatedId && curr.value === "No growth") {
        acc[curr.dataElement] = curr.value;
        arr.push(acc.value);
      }
      return acc;
    }, {});
    return arr;
  });

  return (
    <div>
      <div>
        {forms?.map((form, formIndex) => (
          <React.Fragment key={formIndex}>
            {form.sections
              ? form.sections?.map((section, sectionIndex) => {
                  return (
                    <SectionForm
                      key={formIndex}
                      section={section}
                      saveValue={debouncedSaveValue}
                      validate={validate}
                      validationErrors={validationErrors}
                      setValidationErrors={setValidationErrors}
                      setIsValidating={setIsValidating}
                      isLastSection={sectionIndex === form.sections?.length - 1 && Array.isArray(forms[forms?.length - 1])}
                      events={enrollmentData?.events}
                    />
                  );
                })
              : Object.entries(form).map(([sectionName, formItems], sectionIndex) =>
                  formatEvents?.length > 0 &&
                  sectionName?.toLowerCase()?.includes("antimicrobial susceptibility testing") ? null : (
                    <React.Fragment key={sectionIndex}>
                      <Section title={sectionName} />
                      {formItems.map((formItem, idx) => (
                        <>
                          {formItem.sections?.map((section, index) => (
                            <SectionForm
                              key={index}
                              index={idx}
                              saveValue={debouncedSaveValue}
                              section={section}
                              className={classes.formList}
                              validate={validate}
                              validationErrors={validationErrors}
                              setValidationErrors={setValidationErrors}
                              setIsValidating={setIsValidating}
                              isLastSection={index === formItem.sections?.length - 1}
                              getEnrollment={getEnrollment}
                              events={enrollmentData?.events}
                            />
                          ))}
                        </>
                      ))}
                      <div className={classes.add}>
                        <Button
                          type="dashed"
                          onClick={async () => {
                            setLoading(true);

                            const event = await createEvent(formItems[0]?.stageId, []);
                            const parentName = forms[0]?.title;

                            if (parentName?.toLowerCase()?.includes("post-operative")) {
                              const payload = { parentEvent: "", event };
                              await saveData("repeatSections", "postOperative", payload);
                            }

                            if (event) {
                              const eventData = await getEvent(event);

                              if (eventData) {
                                const newForm = { ...form };
                                const updatedSection = {
                                  ...formItems[0],
                                  event: eventData.event,
                                  sections: formItems[0]?.sections?.map((section) => ({
                                    ...section,
                                    event: eventData.event,
                                    status: eventData.status,
                                    trackedEntityInstance: eventData.trackedEntityInstance,
                                    enrollment: eventData.enrollment,
                                    enrollmentStatus: eventData.enrollmentStatus,
                                    orgUnit: eventData.orgUnit,
                                    program: eventData.program,
                                    programStage: eventData.programStage,
                                    dataElements: section.dataElements?.map((dataElement) => {
                                      const dataElementValue = eventData?.dataValues?.find(
                                        (dataValue) => dataValue.dataElement === dataElement.id
                                      );
                                      return { ...dataElement, value: formatValue(dataElementValue?.value) };
                                    }),
                                  })),
                                };

                                newForm[sectionName] = [...(newForm[sectionName] || []), updatedSection];

                                const newForms = [...forms];
                                newForms[formIndex] = newForm;

                                setForms(newForms);
                                setLoading(false);
                              }
                            }
                          }}
                          block
                          icon={<PlusCircleOutlined />}
                          loading={loading}
                          disabled={loading}
                        >
                          Add {sectionName?.toLowerCase()}
                        </Button>
                      </div>
                    </React.Fragment>
                  )
                )}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button className={classes.cancelButton} onClick={() => navigate(surgeryLink)}>
          Cancel
        </Button>
        <Button
          className={classes.submitButton}
          onClick={async () => {
            setChecked(true);
            setValidate(true);
            setIsValidating(true);
            setTimeout(() => {
              setValidate(false);
            }, 1000);
          }}
          loading={isValidating}
        >
          Submit
        </Button>
        {alert && <Alert critical>{alert}</Alert>}
      </div>
    </div>
  );
}
