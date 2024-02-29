import React, { useState } from "react";
import { Button, Form, Divider } from "antd";
import { createUseStyles } from "react-jss";
import { useNavigate } from "react-router-dom";
import UseDataStore from "../hooks/useDataStore";
import useEnrollment from "../hooks/useEnrollment";
import InputItem from "./InputItem";
import useEvents from "../hooks/useEvents";
import { evaluateShowIf, evaluateValidations, formatAttributes, formatDataValues } from "../lib/helpers";
import Accordion from "./Accordion";

import {
  getNonRepeatingEvents,
  getRepeatingEvents,
  getRepeatingValues,
  getSectionEvents,
  getSectionMappings,
  getUpdatedEvents,
} from "../lib/stageHelpers";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import UseInstances from "../hooks/useInstances";
import RenderFormSection from "./RenderFormSection";

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
  const [preFilled, setPreFilled] = useState({});

  const [form] = Form.useForm();
  const classes = useStyles();

  const navigate = useNavigate();

  const { getEnrollmentData } = UseInstances();

  const attributes = useSelector((state) => state.attributes);
  const dataElements = useSelector((state) => state.dataElements);

  const { getData, saveData } = UseDataStore();
  const { updateEnrollment } = useEnrollment();

  const { createEvents, deleteEvents } = useEvents();

  const handleSubmit = async () => {};

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
            formValues={ formValues }
            dataValues={dataValues}
            stageForm={stageForm}
            eventId={eventId}
            getEnrollment={getEnrollment}
          />
        );
      })}
    </div>
  );
}
