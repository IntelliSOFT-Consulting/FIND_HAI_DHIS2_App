import { useState, useEffect } from "react";
import { Button, Table, Radio, Form, message } from "antd";
import Accordion from "./Accordion";
import { evaluateShowIf, evaluateValidations, formatAttributes, formatDataValues, toTitleCase } from "../lib/helpers";
import { dataElements, stages } from "../contants/ids";
import { formatValue } from "../lib/mapValues";
import InputItem from "./InputItem";
import { createUseStyles } from "react-jss";
import UseEvents from "../hooks/useEvents";
import UseDataStore from "../hooks/useDataStore";

const useStyles = createUseStyles({
  fullWidth: {
    width: "100% !important",
    margin: "1rem",
    "& > div": {
      width: "100% !important",
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
});

export default function Symptoms({ stage, events, program, orgUnit, trackedEntityInstance, event }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [currentSymptoms, setCurrentSymptoms] = useState([]);
  const [eventMapping, setEventMapping] = useState([]);
  const [allMappings, setAllMappings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const classes = useStyles();

  const { getData, saveData } = UseDataStore();

  const { createEvents } = UseEvents();

  const populateSymptoms = () => {
    const syptomDataElement = stage?.stage?.sections
      ?.find((section) => section.sectionName === "Symptoms")
      ?.elements?.find((element) => element.name === "Symptoms");

    const initial = syptomDataElement?.options?.map((item) => {
      return { [syptomDataElement.id]: item.value, xS5SzaMlRUu: false };
    });
    setSelectedSymptoms(initial);
  };

  useEffect(() => {
    populateSymptoms();
    if (stage) {
      handleLoadDefaults(events);
    }
  }, [stage, events]);

  const handleLoadDefaults = async (events) => {
    setLoading(true);
    const mappings = await getData("repeatSections", "postOperative");
    const symptoms = mappings?.filter((item) => event === item?.parentEvent);
    setAllMappings(mappings);
    setEventMapping(symptoms);
    const eventIds = symptoms?.map((item) => item?.event);
    const stageEvents = events?.filter((event) => eventIds.includes(event.event) && event.programStage === stages.symptoms);
    setCurrentSymptoms(stageEvents);
    const mappedEvents = stageEvents?.map((event) => {
      return event.dataValues.reduce((acc, curr) => {
        acc[curr.dataElement] = formatValue(curr.value);
        if (curr.dataElement === dataElements.otherSymptoms && curr.value) {
          form.setFieldsValue({ [dataElements.otherSymptoms]: curr.value });
        }
        return acc;
      }, {});
    });

    mappedEvents?.forEach((event) => {
      const found = selectedSymptoms.find((symptom) => symptom[dataElements.symptoms] === event[dataElements.symptoms]);

      if (found) {
        const index = selectedSymptoms.indexOf(found);
        setSelectedSymptoms((prev) => [
          ...prev.slice(0, index),
          { ...prev[index], [dataElements.symptomPresence]: event[dataElements.symptomPresence] },
          ...prev.slice(index + 1),
        ]);
      }
    });

    setLoading(false);
  };

  const handlePresentChange = (e, value) => {
    const { name, value: selectedValue } = e.target;
    const found = selectedSymptoms.find((symptom) => symptom[dataElements.symptoms] === value);

    if (found) {
      const index = selectedSymptoms.indexOf(found);

      setSelectedSymptoms((prev) => [
        ...prev.slice(0, index),
        { ...prev[index], [name]: selectedValue },
        ...prev.slice(index + 1),
      ]);
    }
  };

  const columns = [
    {
      title: "Symptoms",
      dataIndex: "symptom",
      key: "symptom",
      render: (text, record) => <div>{text}</div>,
    },
    {
      title: "Present",
      dataIndex: "present",
      key: "present",
      render: (text, record) => (
        <Radio.Group
          value={
            selectedSymptoms.find((symptom) => symptom[dataElements.symptoms] === record.key)?.[dataElements.symptomPresence]
          }
          name="xS5SzaMlRUu"
          onChange={(e) => handlePresentChange(e, record.key)}
        >
          <Radio value={true}>Yes</Radio>
          <Radio value={false}>No</Radio>
        </Radio.Group>
      ),
    },
  ];

  const onFinish = async (values) => {
    setSaving(true);
    // look for a string value in the values
    const other = values[dataElements.otherSymptoms]?.trim();
    // create data values for the selected symptoms. Each selected symptom will be saved as a separate event
    const dataValues = selectedSymptoms.map((symptom, i) => {
      const ids = Object.keys(symptom);
      const data = ids.map((id) => {
        return { dataElement: id, value: symptom[id] };
      });
      if (other && i === 0) {
        data.push({ dataElement: dataElements.otherSymptoms, value: other });
      }
      return data;
    });

    if (currentSymptoms.length > 1) {
      const payload = currentSymptoms.map((event, index) => {
        return {
          ...event,
          dataValues: dataValues[index],
        };
      });
      await createEvents(payload);
    } else {
      const payload = dataValues.map((dataValue, i) => {
        const existing = { ...currentSymptoms[i] } ? { ...currentSymptoms[i] } : {};
        return {
          ...existing,
          program,
          programStage: stages.symptoms,
          orgUnit,
          trackedEntityInstance,
          status: "COMPLETED",
          dataValues: dataValue,
        };
      });
      const savedEvents = await createEvents(payload);
      const newMappings = savedEvents?.map((id) => {
        return { parentEvent: event, event: id };
      });

      const updatedMappings = [...allMappings, ...newMappings];
      await saveData("repeatSections", "postOperative", updatedMappings);
    }
    setSaving(false);
    message.success("Symptoms saved successfully!");
  };
  return (
    <Form form={form} layout="vertical" className={classes.fullWidth} onFinish={onFinish}>
      {stage?.stage?.sections?.map((sectionItem) => {
        return (
          <>
            {sectionItem.sectionName !== stage?.title && sectionItem.sectionName?.trim() && (
              <Accordion title={toTitleCase(sectionItem.sectionName)} key={sectionItem.id} open={true}>
                {sectionItem.elements?.map((dataElement) => {
                  return dataElement?.name === "Symptoms" ? (
                    <Table
                      size="small"
                      dataSource={dataElement.options?.map((item) => {
                        return {
                          key: item.value,
                          symptom: item.value,
                          present: selectedSymptoms?.includes(item.id),
                        };
                      })}
                      columns={columns}
                      pagination={false}
                      showHeader={false}
                      loading={loading}
                    />
                  ) : (
                    <Form.Item
                      key={dataElement.id}
                      label={dataElement.name}
                      name={dataElement.id}
                      hidden={dataElement?.id === dataElements.symptomPresence}
                    >
                      <InputItem type={dataElement.valueType} dataElement={dataElement} />
                    </Form.Item>
                  );
                })}
                <Form.Item>
                  <Button className={classes.submitButton} type="primary" htmlType="submit" disabled={saving} loading={saving}>
                    Save
                  </Button>
                </Form.Item>
              </Accordion>
            )}
          </>
        );
      })}
    </Form>
  );
}
