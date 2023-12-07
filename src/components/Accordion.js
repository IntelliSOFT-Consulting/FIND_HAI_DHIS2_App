import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import { Button } from "antd";

const useStyles = createUseStyles({
  accordion: ({ isActive }) => ({
    width: "100%",
    margin: "2rem auto",
    border: isActive ? "1px solid #ccc" : "none",
  }),
  accordionTitle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    cursor: "pointer",
    backgroundColor: "#F6F6F6",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "2px",
    padding: "10px",
    color: "#0067B9",
    "&:hover": {
      backgroundColor: "#efefef",
    },
  },
  accordionButton: {},
  accordionContent: {
    padding: "0px",
  },
  accordionFooter: {
    padding: "1rem",
    backgroundColor: "#E5F1FA",
    display: "flex",
    justifyContent: "flex-end",
  },
});

const Accordion = ({ title, footer, open, children }) => {
  const [isActive, setIsActive] = useState(open);
  const classes = useStyles({ isActive });

  return (
    <div className={classes.accordion}>
      <div className={classes.accordionTitle}>
        <div>{title}</div>
        <div className={classes.accordionButton}>
          {!isActive && (
            <Button type="primary" onClick={() => setIsActive(!isActive)}>
              Add
            </Button>
          )}
        </div>
      </div>
      {isActive && <div className={classes.accordionContent}>{children}</div>}
      {footer && isActive && <div className={classes.accordionFooter}>{footer}</div>}
    </div>
  );
};

export default Accordion;
