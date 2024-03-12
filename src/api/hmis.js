import axios from "axios";
import { message } from "antd";

const { REACT_APP_HMIS_AUTH_TOKEN, REACT_APP_HMIS_AUTH_USERNAME, REACT_APP_HMIS_AUTH_PASSWORD } = process.env;

export const fetchHmisPatient = async (patientId) => {
  if (!REACT_APP_HMIS_AUTH_TOKEN && !REACT_APP_HMIS_AUTH_USERNAME && !REACT_APP_HMIS_AUTH_PASSWORD) {
    return null;
  }

  const auth = REACT_APP_HMIS_AUTH_TOKEN
    ? { Authorization: `Bearer ${REACT_APP_HMIS_AUTH_TOKEN}` }
    : { Authorization: `Basic ${Buffer.from(`${REACT_APP_HMIS_AUTH_USERNAME}:${REACT_APP_HMIS_AUTH_PASSWORD}`).toString("base64")}` };

  try {
    const response = await axios.get(`/hmis/${patientId}`, {
      headers: {
        ...auth,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    message.error("Failed to fetch patient data from HMIS. Searching for patient in local database.");
    throw new Error("Failed to fetch patient data from HMIS")
  }
};