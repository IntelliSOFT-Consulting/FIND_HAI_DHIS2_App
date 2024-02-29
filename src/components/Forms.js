import React, { useEffect, useState } from "react";
import { Form, Button } from "antd";
import SurgeryHeader from "./SurgeryHeader";
import InputItem from "./InputItem";
import Section from "./Section";
import { createUseStyles } from "react-jss";
import Grid from "./Grid";
import UseSaveEvent from "../hooks/useSaveEvent";
import AlertBar from "./Alert";
import { generateId } from "../lib/helpers";
import { useNavigate } from "react-router-dom";

const useStyles = createUseStyles({
  form: {},
  submit: {
    gridColumn: "span 2",
    display: "flex",
    justifyContent: "flex-end",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "2rem",
    padding: "1rem",
    "& > div": {
      maxWidth: "500px !important",
      width: "100% !important",
      "&:nth-child(even)": {
        marginLeft: "auto !important",
      },
    },
  },
});

const Forms = ({
  surgery,
  initialValues,
  edit,
  programStageId,
  instanceId,
  getInstances,
  organisationUnit,
  trackedEntityType,
  program,
}) => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const classes = useStyles();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { saveEvent } = UseSaveEvent({
    programId: null,
    programStage: programStageId,
    orgUnit: organisationUnit?.id,
  });

  useEffect(() => {
    const values = Object.values(initialValues);
    if (values?.length > 0) {
      form.setFieldsValue(initialValues);
    } else {
      form.setFieldsValue({
        v8XEw90JFmX: generateId(),
      });
    }
  }, [initialValues]);

  const hasValues = (surgery) => {
    return Object.keys(initialValues).find((key) => {
      const dataElements = surgery.sections
        .map((section) => {
          return section.dataElements.map((dataElement) => {
            return dataElement.id;
          });
        })
        ?.flat();
      return dataElements.includes(key);
    });
  };

  const onFinish = async (values) => {
    let payload;
    if (surgery.enrollment) {
      payload = {
        trackedEntityType: trackedEntityType?.id,
        orgUnit: organisationUnit?.id,
        attributes: Object.keys(values).map((key) => {
          return {
            attribute: key,
            value: values[key],
          };
        }),
        enrollments: [
          {
            orgUnit: organisationUnit?.id,
            program: program?.id,
            enrollmentDate: new Date(),
            incidentDate: new Date(),
          },
        ],
      };
    } else {
      payload = {
        program: program?.id,
        // programStage: programStageId,
        trackedEntityInstance: instanceId,
        eventDate: new Date(),
        orgUnit: organisationUnit?.id,
        programStage: surgery.id,
        dataValues: Object.keys(values).map((key) => {
          return {
            dataElement: key,
            value: values[key],
          };
        }),
      };
    }
    const { response, error } = await saveEvent(payload, surgery.enrollment);
    if (response) {
      getInstances();
      setSuccess("Successfully saved");

      const instance = payload.trackedEntityType ? response?.response?.importSummaries[0]?.reference : instanceId;
      if (instance) {
        navigate(`/forms/${instance}`);
      }

      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
    if (error) {
      setError("Failed to save");
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  };

  return (
    <Form
      className={classes.form}
      layout="vertical"
      name={surgery.title}
      initialValues={initialValues}
      form={form}
      onFinish={onFinish}
      autoComplete="off"
    >
      {success && (
        <AlertBar icon success>
          {success}
        </AlertBar>
      )}
      {error && (
        <AlertBar icon critical>
          {error}
        </AlertBar>
      )}
      {hasValues(surgery) && !edit ? (
        <Grid surgery={surgery} initialValues={initialValues} />
      ) : (
        <SurgeryHeader
          title={surgery.title}
          footer={
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          }
          open={hasValues(surgery) || surgery.enrollment === true}
        >
          {surgery.sections.map((section, index) => {
            return (
              <>
                <Section key={index} title={section.title} />

                <div className={classes.content}>
                  {section.dataElements.map((dataElement) => {
                    return (
                      <Form.Item
                        key={dataElement.id}
                        label={dataElement.name}
                        name={dataElement.id}
                        rules={[
                          {
                            required: dataElement.compulsory,
                            message: `Please input ${dataElement.name}!`,
                          },
                        ]}
                      >
                        <InputItem
                          type={dataElement?.optionSet ? "SELECT" : dataElement.valueType}
                          options={dataElement?.optionSet?.options?.map((option) => {
                            return {
                              label: option.displayName,
                              value: option.code,
                            };
                          })}
                          size="large"
                          placeholder={`Enter ${dataElement.name}`}
                        />
                      </Form.Item>
                    );
                  })}
                </div>
              </>
            );
          })}
        </SurgeryHeader>
      )}
    </Form>
  );
};

export default Forms;
