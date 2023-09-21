import React from "react";
import { Card } from "@dhis2/ui";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2C6693",
    color: "white",
    margin: 0,
    padding: "10px 1.5rem",
    marginBottom: "20px",
    fontSize: "14px",
    width: "100%",
  },
  card: {
    height: "fit-content !important",
  },
  cardTitle: {
    backgroundColor: "#2C6693",
    color: "white",
    margin: "0px",
    padding: "1rem 1.5rem",
    marginBottom: "20px",
    fontSize: "14px",
  },
  footer: {
    padding: "10px 1.5rem",
    backgroundColor: "#E3EEF7",
  },
});

export default function CardItem({ title, footer, children }) {
  const styles = useStyles();
  return (
    <Card className={styles.card}>
      {typeof title === "string" ? (
        <h5 className={styles.cardTitle}>{title}</h5>
      ) : (
        <div className={styles.header}>{title}</div>
      )}
      <div
        style={{
          padding: 20,
        }}
      >
        {children}
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </Card>
  );
}
