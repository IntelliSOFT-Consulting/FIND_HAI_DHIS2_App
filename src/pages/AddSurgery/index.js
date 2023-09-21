import React from "react";
import CardItem from "../../components/CardItem";
import { Collapse } from "antd";
import PatientDetails from "./Forms/PatientDetails";
import PeriOperative from "./Forms/PeriOperative";

const forms = [PatientDetails, PeriOperative];

export default function Index() {
  return (
    <CardItem title="SURGERY DETAILS">
      {forms?.map((Item) => (
        <div
          style={{
            marginBottom: "1rem",
          }}
        >
          <Item />
        </div>
      ))}
    </CardItem>
  );
}
