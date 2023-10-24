import React from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  section: ({ title, padded }) => ({
    width: "100%",
    margin: padded ? "2rem auto" : "0px",
    display: title ? "block" : "none",
    borderRadius: "2px",
  }),
  title: ({ primary }) => ({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    cursor: "pointer",
    backgroundColor: primary ? "#E5F1FA" : "#EAEEF0",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "2px",
    padding: "10px",
    color: "#0067B9",
    "& > div": {
      width: "100%",
    },
  }),
});

export default function Section({ title, primary, padded }) {
  const trimmedTitle = typeof title === "string" ? title.trim() : title;
  const classes = useStyles({ title: trimmedTitle, primary, padded });
  return (
    <div className={classes.section}>
      <div className={classes.title}>
        <div>{title}</div>
      </div>
    </div>
  );
}
