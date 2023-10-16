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
import { generateId } from "../lib/helpers";

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
  const { registration, trackedEntityType, program } = useSelector(
    (state) => state.forms
  );
  const { id } = useSelector((state) => state.orgUnit);
  const classes = useStyles();
  const engine = useDataEngine();

  const [form] = Form.useForm();

  const navigate = useNavigate();

  const { findPatientInstance } = UseFindPatientInstance();
  const { getEnrollmentData } = UseGetEnrollmentsData();

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

          const dataElement = dataElements?.find(
            (dataElement) => dataElement.id === attribute
          );

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
  useEffect(() => {
    if (dataElements?.length === 0) return;
    const secondaryIdField = dataElements?.find(
      (dataElement) => dataElement.name === "Secondary ID"
    );

    const secondaryId = form.getFieldValue(secondaryIdField?.id);

    if (!secondaryId) {
      form.setFieldsValue({
        [secondaryIdField?.id]: uniqueId,
      });
    }
  }, [dataElements]);

  const onFinish = async (values) => {
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
        const trackedEntityInstance = await getEnrollmentData(
          response?.importSummaries[0]?.reference,
          null,
          true
        );
        console.log("trackedEntityInstance", trackedEntityInstance);
        navigate(
          `/surgery/${response?.importSummaries[0]?.reference}/${trackedEntityInstance?.enrollment}`
        );
      }
    } catch (error) {
      const conflicts = getConflicts(error?.details, registration);
      setError(conflicts);
    }
  };
  return (
    <CardItem title="REGISTER PATIENT">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        {registration?.sections?.map((section) => (
          <>
            <Section key={section.title} title={section.title} />
            <div className={classes.form}>
              {section?.dataElements?.map((dataElement) => (
                <Form.Item
                  key={dataElement.id}
                  label={dataElement.name}
                  name={dataElement.id}
                  rules={[
                    {
                      required: dataElement.compulsory,
                      message: `Please input ${dataElement.displayName}!`,
                    },
                  ]}
                >
                  <InputItem
                    type={
                      dataElement.optionSet ? "SELECT" : dataElement.valueType
                    }
                    options={dataElement.optionSet?.options?.map((option) => ({
                      label: option.name,
                      value: option.code,
                    }))}
                    placeholder={`Enter ${dataElement.name}`}
                    name={dataElement.id}
                  />
                </Form.Item>
              ))}
            </div>
          </>
        ))}
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
      {error && <ErrorModal error={error} setError={setError} />}
    </CardItem>
  );
}
