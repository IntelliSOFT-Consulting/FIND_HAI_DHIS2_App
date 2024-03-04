import React, { useState, useEffect } from "react";
import { Form } from "antd";
import { createUseStyles } from "react-jss";
import { useNavigate } from "react-router-dom";
import UseDataStore from "../hooks/useDataStore";
import useEnrollment from "../hooks/useEnrollment";
import useEvents from "../hooks/useEvents";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import UseInstances from "../hooks/useInstances";
import RenderFormSection from "./RenderFormSection";
import * as constants from "../contants/ids";
import { formatValue } from "../lib/mapValues";

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
    borderTop: "0.5px solid rgba(0,0,0,0.1)",
    marginTop: "1rem",
  },
  submitButton: {
    margin: "5px",
    backgroundColor: "#026C26 !important",
    color: "white",
    borderColor: "#026C26 !important",
    "&:hover": {
      backgroundColor: "#026C26 !important",
      color: "white !important",
    },
  },
  cancelButton: {
    margin: "5px",
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

export default function Stage({ dataValues, stageForm, getEnrollment, eventId, stageEvents, enrollmentData }) {
  const [formValues, setFormValues] = useState(null);
  const [error, setError] = useState(null);
  const [sampleId, setSampleId] = useState(null);
  const [signOfInfection, setSignOfInfection] = useState(null);
  const [cultureFindings, setCultureFindings] = useState(null);

  const [form] = Form.useForm();
  const classes = useStyles();

  const attributes = useSelector((state) => state.attributes);
  const dataElements = useSelector((state) => state.dataElements);

  const populateSampleId = (events) => {
    const sampleDataId = constants.dataElements.sampleId;
    const signOfInfectionId = constants.dataElements.signOfInfection;
    const cultureFindingsId = constants.dataElements.cultureFindings;
    const sampleEvent = events.find((event) => event?.dataValues.find((dataValue) => dataValue.dataElement === sampleDataId));
    const signOfInfectionEvent = events?.find((event) => event?.dataValues.find((dataValue) => dataValue.dataElement === signOfInfectionId));
    const cultureFindingsEvent = events?.find((event) => event?.dataValues.find((dataValue) => dataValue.dataElement === cultureFindingsId));

    if (signOfInfectionEvent) {
      const signOfInfectionData = signOfInfectionEvent.dataValues.find((dataValue) => dataValue.dataElement === signOfInfectionId);
      setSignOfInfection(formatValue(signOfInfectionData.value));
    }

    if (sampleEvent) {
      const sampleData = sampleEvent.dataValues.find((dataValue) => dataValue.dataElement === sampleDataId);
      setSampleId(sampleData.value);
    }

    if (cultureFindingsEvent) {
      const cultureFindingsData = cultureFindingsEvent.dataValues.find((dataValue) => dataValue.dataElement === cultureFindingsId);
      setCultureFindings(formatValue(cultureFindingsData.value));
    }
  };

  useEffect(() => {
    if (stageEvents) {
      populateSampleId(stageEvents);
    }
  }, [stageEvents]);

  return (
    <div className={`${classes.form} ${classes.fullWidth}`}>
      {stageForm.sections.map((section, index) => {
        return (
          <RenderFormSection
            section={section}
            key={section.id}
            dataElements={dataElements}
            attributes={attributes}
            stageEvents={stageEvents}
            formValues={formValues}
            dataValues={dataValues}
            stageForm={stageForm}
            eventId={eventId}
            getEnrollment={getEnrollment}
            sampleId={sampleId}
            signOfInfection={signOfInfection}
            cultureFindings={cultureFindings}
          />
        );
      })}
    </div>
  );
}
