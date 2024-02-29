import { formatValue } from "./mapValues";

export const formatForm = (stage, values) => {
  const formattedFormValues = {};

  stage?.sections?.forEach((section) => {
    if (section?.repeatable && section.stageId !== "IbB9QEgQU6D") {
      const sectionValues = values?.filter((value) => value?.programStage === section?.stageId);

      formattedFormValues[section?.stageId] = sectionValues?.map((value) => {
        return section.elements?.reduce((acc, currDataElement) => {
          const itemValue = value?.dataValues?.find((dataValue) => dataValue?.dataElement === currDataElement?.id)?.value;
          return {
            ...acc,
            [currDataElement?.id]: itemValue === undefined ? null : formatValue(itemValue),
          };
        }, {});
      });
    } else {
      const sectionValues = values?.find((value) => value?.programStage === section?.stageId);
      section?.elements?.forEach((dataElement) => {
        const formattedValue = formatValue(
          sectionValues?.dataValues?.find((value) => value?.dataElement === dataElement?.id)?.value
        );
        formattedFormValues[dataElement?.id] = formattedValue === undefined ? null : formattedValue;
      });
    }
  });

  return formattedFormValues;
};

const createNewEvent = (submission, metaData, stageId) => ({
  program: metaData?.program,
  programStage: stageId,
  trackedEntityInstance: metaData?.trackedEntityInstance,
  orgUnit: metaData?.orgUnit,
  status: "COMPLETED",
  dataValues: submission,
  eventDate: new Date().toISOString().slice(0, 10),
});

const updateEvent = (submission, stageEvent) => ({
  ...stageEvent,
  dataValues: submission,
});

const handleMultipleValues = (formattedSubmissions, stageEvents, metaData) => {
  const stageId = formattedSubmissions[0]?.stageId;
  const multipleSubmissions = formattedSubmissions.flatMap((submission) =>
    submission?.value?.map((value) => [{ dataElement: submission?.dataElement, value }])
  );

  return multipleSubmissions.map((submission, index) => {
    if (stageEvents[index]) {
      return updateEvent(submission, stageEvents[index]);
    }
    return createNewEvent(submission, metaData, stageId);
  });
};

const handleSingleValues = (formattedSubmissions, stageEvents, metaData, stage, valueIndex) => {
  const updatedEvent = createNewEvent(formattedSubmissions, metaData, stage?.stageId);

  if (stageEvents && stageEvents[valueIndex]) {
    updatedEvent.event = stageEvents[valueIndex]?.event;
  }

  return [updatedEvent];
};

export const formatSubmissions = (formValues, stage, stageEvents, metaData) => {
  const valuesArray = formValues[Object.keys(formValues)[0]];
  const allSubmissions = [];
  const dataElements = stage?.sections?.reduce((acc, curr) => [...acc, ...curr?.elements], []);

  valuesArray?.forEach((values, valueIndex) => {
    const formattedSubmissions = dataElements
      ?.filter((dataElement) => values[dataElement?.id] !== undefined)
      ?.map((dataElement) => ({
        dataElement: dataElement?.id,
        value: values[dataElement?.id],
        multiple: dataElement?.multiple,
        stageId: dataElement?.stageId,
      }));

    const multipleValues = formattedSubmissions?.filter((submission) => submission?.multiple);
    const submissions =
      multipleValues?.length > 0
        ? handleMultipleValues(multipleValues, stageEvents, metaData)
        : handleSingleValues(formattedSubmissions, stageEvents, metaData, stage, valueIndex);

    allSubmissions.push(submissions);
  });

  return allSubmissions.flat();
};

export const formatDefaultValues = (stageEvents, stageForm, repeatable = false) => {
  const defaultValues = {
    [stageForm?.stageId]: [],
  };

  const allDataElements = stageForm?.sections?.reduce((acc, curr) => {
    return [...acc, ...curr?.elements];
  }, []);

  const multipleDataElements = allDataElements?.filter((dataElement) => dataElement?.multiple);
  const singleDataElements = allDataElements?.filter((dataElement) => !dataElement?.multiple);

  if (repeatable) {
    multipleDataElements?.forEach((dataElement) => {
      const values = stageEvents
        ?.map((event) => {
          return event?.dataValues?.find((value) => value?.dataElement === dataElement?.id)?.value;
        })
        ?.filter((value) => value);

      defaultValues[stageForm?.stageId].push({
        [dataElement?.id]: values,
      });
    });

    singleDataElements?.forEach((dataElement) => {
      stageEvents?.forEach((event, index) => {
        const value = event?.dataValues?.find((value) => value?.dataElement === dataElement?.id)?.value;

        if (defaultValues[stageForm?.stageId][index]) {
          defaultValues[stageForm?.stageId][index] = {
            ...defaultValues[stageForm?.stageId][index],
            [dataElement?.id]: formatValue(value),
          };
        } else {
          defaultValues[stageForm?.stageId][index] = {
            [dataElement?.id]: formatValue(value),
          };
        }
      });
    });
  } else {
    multipleDataElements?.forEach((dataElement) => {
      const values = stageEvents
        ?.map((event) => {
          return event?.dataValues?.find((value) => value?.dataElement === dataElement?.id)?.value;
        })
        ?.filter((value) => value);
      if (defaultValues[stageForm?.stageId]?.length) {
        defaultValues[stageForm?.stageId] = [
          {
            ...defaultValues[stageForm?.stageId][0],
            [dataElement?.id]: values,
          },
        ];
      } else {
        defaultValues[stageForm?.stageId].push({
          [dataElement?.id]: values,
        });
      }
    });

    singleDataElements?.forEach((dataElement) => {
      const value = stageEvents
        ?.find((event) => event?.programStage === stageForm?.stageId)
        ?.dataValues?.find((value) => value?.dataElement === dataElement?.id)?.value;

      if (defaultValues[stageForm?.stageId]?.length) {
        defaultValues[stageForm?.stageId] = [
          {
            ...defaultValues[stageForm?.stageId][0],
            [dataElement?.id]: formatValue(value),
          },
        ];
      } else {
        defaultValues[stageForm?.stageId].push({
          [dataElement?.id]: formatValue(value),
        });
      }
    });
  }

  return defaultValues;
};
