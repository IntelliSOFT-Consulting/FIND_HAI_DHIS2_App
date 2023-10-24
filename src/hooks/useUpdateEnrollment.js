import { useDataEngine } from "@dhis2/app-runtime";

export default function UseUpdateEnrollment() {
  const engine = useDataEngine();

  const updateEnrollment = async (enrollment, data) => {
    try {
      const response = await engine.mutate({
        resource: `enrollments/${enrollment}`,
        type: "update",
        data: {
          ...data,
        },
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  };

  return { updateEnrollment };
}
