import React from "react";
import { AlertBar } from "@dhis2/ui";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  alert: {
    position: "fixed",
    bottom: "1rem",
    left: "50%",
    transform: "translateX(-50%)",
  },
});

const Alert = ({ children, ...props }) => {
  const classes = useStyles();
  return (
    <div className={classes.alert}>
      <AlertBar {...props}>{children}</AlertBar>
    </div>
  );
};

export default Alert;
