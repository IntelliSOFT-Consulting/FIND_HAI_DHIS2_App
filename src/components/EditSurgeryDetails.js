import { useState } from "react";
import { Drawer, Form, Button } from "antd";
import { useSelector } from "react-redux";
import { useDataEngine } from "@dhis2/app-runtime";
import InputItem from "./InputItem";
import Section from "./Section";
import { formatValue } from "../lib/mapValues";

const EditSurgeryDetails = ({ open, setOpen, enrollment, getEnrollment }) => {
  const [loading, setLoading] = useState(false);

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
            {section?.dataElements?.map((dataElement) => (
              <Form.Item
                key={dataElement?.id}
                label={dataElement?.name}
                name={dataElement?.id}
                rules={[
                  {
                    required: dataElement?.required,
                    message: `Please input ${dataElement?.name}!`,
                  },
                ]}
                disabled={dataElement?.disabled}
              >
                <InputItem
                  type={dataElement.optionSet ? "SELECT" : dataElement.valueType}
                  options={dataElement.optionSet?.options?.map((option) => ({
                    label: option.name,
                    value: option.code,
                  }))}
                  placeholder={dataElement.name}
                  disabled={dataElement?.disabled}
                />
              </Form.Item>
            ))}
          </>
        ))}
      </Form>
    </Drawer>
  );
};

export default EditSurgeryDetails;
