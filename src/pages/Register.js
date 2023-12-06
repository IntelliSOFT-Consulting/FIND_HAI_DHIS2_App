import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Form, Button } from "antd";
import CardItem from "../components/CardItem";
import Section from "../components/Section";
import InputItem from "../components/InputItem";
import { createUseStyles } from "react-jss";
import { useDataEngine } from "@dhis2/app-runtime";
import ErrorModal from "../components/ErrorModal";
import { useNavigate } from "react-router-dom";
import UseFindPatientInstance from "../hooks/useFindPatientInstance";
import UseGetEnrollmentsData from "../hooks/UseGetEnrollmentsData";
import {evaluateShowIf, generateId} from "../lib/helpers";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import useGetProgramInstances from "../hooks/useGetProgramInstances";

dayjs.extend(weekday);
dayjs.extend(localeData);

const dateFormat = "YYYY-MM-DD";

const useStyles = createUseStyles({
  form: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    "& > div": {
      width: "48%",
    },
  },
});

export default function Register() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [enrollments, setEnrollments] = useState(null);

  const { registration, trackedEntityType, program } = useSelector((state) => state.forms);
  const { id } = useSelector((state) => state.orgUnit);
  const classes = useStyles();
  const engine = useDataEngine();

  const [form] = Form.useForm();

  const navigate = useNavigate();

  const { findPatientInstance } = UseFindPatientInstance();
  const { getEnrollmentData } = UseGetEnrollmentsData();
  const { searchPatient } = useGetProgramInstances();

  const getConflicts = (error, registration) => {
    const importSummaries = error?.response?.importSummaries;

    if (importSummaries && importSummaries.length > 0) {
      const conflicts = importSummaries[0]?.conflicts;

      if (conflicts && conflicts.length > 0) {
        const attributes = conflicts.map((conflict) => {
          const words = conflict.value.split(" ");
          const valueIndex = words.findIndex((word) => word === "value");
          const value = words[valueIndex + 1];
          const attribute = words[words.length - 1];

          const dataElements = registration?.sections?.flatMap((section) => {
            return section?.dataElements?.map((dataElement) => ({
              id: dataElement.id,
              name: dataElement.name,
            }));
          });

          const dataElement = dataElements?.find((dataElement) => dataElement.id === attribute);

          return {
            attribute,
            value: value.replace(/'/g, ""),
            name: dataElement?.name,
            message: conflict.value.replace(attribute, dataElement?.name),
          };
        });

        return attributes;
      }
    }
  };

  const dataElements = registration?.sections?.flatMap((section) => {
    return section?.dataElements?.map((dataElement) => ({
      id: dataElement.id,
      name: dataElement.name,
    }));
  });
  const uniqueId = generateId();
  const patientId = dataElements?.find((dataElement) => dataElement.name === "Patient ID");

  useEffect(() => {
    if (dataElements?.length === 0) return;
    const secondaryIdField = dataElements?.find((dataElement) => dataElement.name === "Secondary ID");
    const secondaryId = form.getFieldValue(secondaryIdField?.id);

    if (!secondaryId) {
      form.setFieldsValue({
        [secondaryIdField?.id]: uniqueId,
      });
    }
  }, [dataElements]);


  const register = async (values) => {
    const payload = {
      trackedEntityType: trackedEntityType?.id,
      orgUnit: id,
      attributes: Object.keys(values).map((key) => {
        return {
          attribute: key,
          value: values[key],
        };
      }),
      enrollments: [
        {
          orgUnit: id,
          program,
          enrollmentDate: new Date(),
          incidentDate: new Date(),
        },
      ],
    };

    try {
      const { response } = await engine.mutate({
        resource: "trackedEntityInstances",
        type: "create",
        data: payload,
      });

      if (response?.status === "SUCCESS") {
        const trackedEntityInstance = await getEnrollmentData(response?.importSummaries[0]?.reference, true);
        setLoading(false);
        navigate(`/surgery/${response?.importSummaries[0]?.reference}/${trackedEntityInstance?.enrollment}`);
      }
    } catch (error) {
      const conflicts = getConflicts(error?.details, registration);
      setError(conflicts);
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    const patientEnrollments = await searchPatient(program, patientId?.id, values[patientId?.id]);
    if (patientEnrollments?.length > 0) {
      setEnrollments(patientEnrollments);
      return;
    }
    await register(values);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const dataElements = registration?.sections?.flatMap((section) => {
      return section?.dataElements?.map((dataElement) => ({
        id: dataElement.id,
        name: dataElement.name,
      }));
    });

    const dateOfBirthField = dataElements?.find((dataElement) => dataElement.name === "Date of Birth");
    if (name === dateOfBirthField?.id) {
      const ageField = dataElements?.find((dataElement) => dataElement.name === "Age");
      const age = dayjs().diff(dayjs(value), "year");
      form.setFieldsValue({
        [ageField?.id]: age,
      });
    }
  };
  return (
    <CardItem title="REGISTER NEW PATIENT SURGERY">
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        {registration?.sections?.map((section) => (
          <>
            <Section key={section.title} title={section.title} />
            <div className={classes.form}>
              {section?.dataElements?.map((dataElement) => {
                const rules = [
                  {
                    required: dataElement.required,
                    message: `Please input ${dataElement.displayName}!`,
                  },
                  dataElement?.validator ? { validator: eval(dataElement.validator) } : null,
                ].filter((rule) => rule !== null);
                const shouldShow = !dataElement.showif || evaluateShowIf(dataElement.showif, formValues);
                return shouldShow ? (
                  <Form.Item key={dataElement.id} label={dataElement.name} name={dataElement.id} rules={rules}>
                    <InputItem
                      type={dataElement.optionSet ? "SELECT" : dataElement.valueType}
                      options={dataElement.optionSet?.options?.map((option) => ({
                        label: option.name,
                        value: option.code,
                      }))}
                      placeholder={`Enter ${dataElement.name}`}
                      name={dataElement.id}
                      onChange={(e) => {
                        const name = e?.target?.name || dataElement.id;
                        const value = e?.target?.value || e;
                        const allFormValues = form.getFieldsValue();
                        setFormValues(allFormValues);
                        handleChange({ target: { name, value } });
                      }}
                      disabled={
                        dataElement?.name?.toLowerCase()?.includes("age") ||
                        dataElement?.name?.toLowerCase()?.includes("secondary id")
                      }
                    />
                  </Form.Item>
                ) : null;
              })}
            </div>
          </>
        ))}
        <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
          Submit
        </Button>
      </Form>
      {enrollments && (
        <ErrorModal setLoading={setLoading} enrollments={enrollments} setEnrollments={setEnrollments} enroll={register} values={formValues} />
      )}
    </CardItem>
  );
}
