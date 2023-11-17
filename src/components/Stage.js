import React, { useState } from "react";
import { Button, Form } from "antd";
import { createUseStyles } from "react-jss";
import { useNavigate } from "react-router-dom";
import Section from "./Section";
import InputItem from "./InputItem";
import { PlusCircleOutlined } from "@ant-design/icons";
import UseCreateEvent from "../hooks/useCreateEvent";
import UseGetEvent from "../hooks/useGetEvent";
import UseSaveValue from "../hooks/useSaveValue";
import UseDataStore from "../hooks/useDataStore";
import { formatValue } from "../lib/mapValues";
import { debounce } from "lodash";
import SectionForm from "./SectionForm";

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

export default function Stage({ forms, setForms, surgeryLink }) {
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState(null);

  const classes = useStyles();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { createEvent } = UseCreateEvent();
  const { getEvent } = UseGetEvent();
  const { saveValue } = UseSaveValue();
  const { getData, saveData } = UseDataStore();

  const debouncedSaveValue = debounce(async (value, dataElement, section) => {
    const valueKey = dataElement.id;

    await saveValue(section.event, value, valueKey, section.orgUnit, section.program, section.programStage);
  }, 500);

  return (
    <div>
      <div>
        {forms?.map((form, formIndex) => (
          <React.Fragment key={formIndex}>
            {form.sections
              ? form.sections?.map((section, sectionIndex) => (
                  <SectionForm key={sectionIndex} section={section} saveValue={debouncedSaveValue} />
                ))
              : Object.entries(form).map(([sectionName, formItems], sectionIndex) => (
                  <React.Fragment key={sectionIndex} layout="vertical">
                    <Section title={sectionName} />
                    {formItems.map((formItem, formItemIndex) => (
                      <>
                        {formItem.sections?.map((section, index) => (
                          <SectionForm
                            key={index}
                            saveValue={debouncedSaveValue}
                            section={section}
                            className={classes.formList}
                          />
                        ))}
                      </>
                    ))}
                    <div className={classes.add}>
                      <Button
                        type="dashed"
                        onClick={async () => {
                          setLoading(true);
                          const mappings = await getData("repeatSections", "postOperative");
                          const event = await createEvent(formItems[0]?.stageId, []);
                          // parent stage is the first stage in the form
                          const parentStage = forms[0]?.sections[0]?.programStage;
                          const parentName = forms[0]?.title;

                          if (parentName?.toLowerCase()?.includes("post-operative")) {
                            const payload = {
                              parentEvent: "",
                              event: event,
                            };

                            await saveData("repeatSections", "postOperative", payload);
                          }

                          if (event) {
                            const eventData = await getEvent(event);
                            if (eventData) {
                              const newForm = { ...form };
                              newForm[sectionName] = [
                                ...(newForm[sectionName] || []),
                                {
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
                                      return {
                                        ...dataElement,
                                        value: formatValue(dataElementValue?.value),
                                      };
                                    }),
                                  })),
                                },
                              ];
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
                ))}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button className={classes.cancelButton} onClick={() => navigate(surgeryLink)}>
          Cancel
        </Button>
        <Button className={classes.submitButton} onClick={() => navigate(surgeryLink)}>
          Submit
        </Button>
      </div>
    </div>
  );
}
