import { useState } from "react";
import { Drawer, Form, Button } from "antd";
import { useSelector } from "react-redux";
import { useDataEngine } from "@dhis2/app-runtime";
import InputItem from "./InputItem";
import Section from "./Section";
import { formatValue } from "../lib/mapValues";
import { evaluateShowIf, evaluateValidations } from "../lib/helpers";
import dayjs from "dayjs";

const EditSurgeryDetails = ({ open, setOpen, enrollment, getEnrollment }) => {
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({});

  const [form] = Form.useForm();

  const engine = useDataEngine();

  const { registration } = useSelector((state) => state.forms);

  const onClose = () => {
    setOpen(false);
  };

  const onFinish = async (values) => {
    setLoading(true);
    const data = {
      attributes: Object.keys(values).map((key) => ({
        attribute: key,
        value: values[key],
      })),
      orgUnit: enrollment?.orgUnit,
    };
    const response = await engine.mutate({
      resource: `trackedEntityInstances/${enrollment?.trackedEntityInstance}`,
      type: "update",
      data,
    });
    if (response?.httpStatusCode === 200) {
      setLoading(false);
      getEnrollment();
      onClose();
    }
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

  const dataElements = registration?.sections?.flatMap((section) => {
    return section?.dataElements?.map((dataElement) => ({
      id: dataElement.id,
      name: dataElement.name,
    }));
  });

  return (
    <Drawer
      title="Edit Surgery Details"
      placement="right"
      closable={false}
      onClose={onClose}
      open={open}
      width="50%"
      footer={
        <div
          style={{
            textAlign: "right",
          }}
        >
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button onClick={() => form.submit()} type="primary" loading={loading}>
            Submit
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          ...enrollment?.attributes?.reduce((acc, curr) => {
            return {
              ...acc,
              [curr?.attribute]: formatValue(curr?.value),
            };
          }, {}),
        }}
      >
        {registration?.sections?.map((section) => (
          <>
            <Section key={section?.id} title={section?.title} />
            {section?.dataElements?.map((dataElement) => {
              const shouldShow = !dataElement.showif || evaluateShowIf(dataElement.showif, formValues);
              if (!shouldShow) {
                form.setFieldValue(dataElement.id, null);
              }

              return (
                <Form.Item
                  key={dataElement?.id}
                  label={dataElement?.name}
                  name={dataElement?.id}
                  rules={[
                    {
                      required: dataElement?.required,
                      message: `Please input ${dataElement?.name}!`,
                    },
                    ...evaluateValidations(dataElement?.validator, dataElement, formValues, dataElements),
                  ]}
                  disabled={dataElement?.disabled}
                  hidden={!shouldShow}
                >
                  <InputItem
                    type={dataElement.optionSet ? "SELECT" : dataElement.valueType}
                    options={dataElement.optionSet?.options?.map((option) => ({
                      label: option.name,
                      value: option.code,
                    }))}
                    placeholder={dataElement.name}
                    disabled={
                      dataElement?.name?.toLowerCase()?.includes("age") ||
                      dataElement?.name?.toLowerCase()?.includes("secondary id") ||
                      dataElement?.name?.toLowerCase()?.includes("patient id")
                    }
                    onChange={(e) => {
                      const name = e?.target?.name || dataElement.id;
                      const value = e?.target?.value || e;
                      handleChange({ target: { name, value } });
                      setFormValues(form.getFieldsValue());
                    }}
                  />
                </Form.Item>
              );
            })}
          </>
        ))}
      </Form>
    </Drawer>
  );
};

export default EditSurgeryDetails;
