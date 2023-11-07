import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import UseFindPatientInstance from "../hooks/useFindPatientInstance";
import UseCreateEnrollment from "../hooks/useCreateEnrollment";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

export default function ErrorModal({ error, setError }) {
  const [enrollments, setEnrollments] = useState(null);
  const [patient, setPatient] = useState(null);
  const { id } = useSelector((state) => state.orgUnit);
  const { program, trackedEntityType } = useSelector((state) => state.forms);

  const navigate = useNavigate();

  const patientConflict = error?.find((error) => error.name?.includes("Patient"));

  const { findPatientInstance } = UseFindPatientInstance();
  const { createEnrollment } = UseCreateEnrollment();

  const enrollPatient = async () => {
    const response = await createEnrollment(patient?.trackedEntityInstance, program, id);
    if (response?.httpStatus === "OK") {
      navigate(`/surgery/${patient?.trackedEntityInstance}/${response?.response?.importSummaries[0]?.reference}`);
    }
  };

  const getPatient = async () => {
    const patientInstance = await findPatientInstance(patientConflict?.attribute, patientConflict?.value, id, program);
    const enrollments = patientInstance?.enrollments?.filter((enrollment) => enrollment.status === "ACTIVE");

    if (enrollments?.length === 0) {
      enrollPatient(patientInstance?.trackedEntityInstance);
    }
    setPatient(patientInstance);
    setEnrollments(enrollments);
  };

  useEffect(() => {
    if (patientConflict) {
      getPatient();
    }
  }, [patientConflict]);

  const renderData = () => {
    if (patientConflict && patient && enrollments?.length > 0) {
      return (
        <div>
          <p>
            A patient with {patientConflict?.name} of {patientConflict?.value} already exists!
          </p>
          {enrollments?.length > 0 && (
            <div>
              <p>Active Surgeries:</p>
              <ul>
                {enrollments?.map((enrollment) => {
                  const surgeryName = enrollment?.attributes?.find((item) => item.displayName === "Surgical Procedure")?.value;
                  return (
                    <li>
                      <Link to={`/surgery/${patient?.trackedEntityInstance}/${enrollment?.enrollment}`}>{surgeryName}</Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return (
      <div>
        <p>An error occurred. Please check the summary below:</p>
        <ul>
          {error?.map((error) => (
            <li>{error?.message}</li>
          ))}
        </ul>
      </div>
    );
  };

  const handleOk = async () => {
    if (enrollments?.length > 0) {
      enrollPatient(patient?.trackedEntityInstance);
    } else {
      setError(false);
    }
  };

  return (
    <Modal
      title="Error"
      open={error}
      onCancel={() => setError(false)}
      onOk={handleOk}
      okButtonProps={{ disabled: enrollments?.length > 0 ? false : true }}
      okText={enrollments?.length > 0 ? "Register new surgery?" : "Ok"}
    >
      {renderData()}
    </Modal>
  );
}
