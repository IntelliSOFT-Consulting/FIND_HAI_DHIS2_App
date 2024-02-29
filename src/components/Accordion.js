import React, { useState, useRef } from "react";
import { createUseStyles } from "react-jss";
import { TransitionMotion, spring } from "react-motion";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";

const useStyles = createUseStyles({
  accordion: {
    border: "0.5px solid rgba(0,0,0,.125)",
    boxShadow: "0px 1px 2px 0px rgba(33, 41, 52, 0.06), 0px 1px 3px 0px rgba(33, 41, 52, 0.1)",
    marginBottom: "1rem",
  },
  accordionItem: {
    borderBottom: "1px solid #ccc",
  },
  accordionHeader: {
    padding: "10px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "40px",
    color: "#fff",
    position: "relative",
  },
  icon: {
    position: "absolute",
    right: "10px",
  },
  accordionTitleActive: {
    backgroundColor: "#f0f0f0",
  },
  content: {
    backgroundColor: "white",
    transition: "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out",
  },
  show: {
    maxHeight: "5000px",
    opacity: 1,
    overflow: "hidden",
    height: "fit-content",
    padding: "10px",
  },
  hide: {
    maxHeight: 0,
    overflow: "hidden",
    opacity: 0,
  },
});

const Accordion = ({ title, open = false, extra, children }) => {
  const [activeIndex, setActiveIndex] = useState(open);

  const childRef = useRef(null);

  const classes = useStyles();
  const onItemClick = () => {
    if (!activeIndex) {
      childRef.current.style.padding = "10px";
      setActiveIndex(!activeIndex);
    } else {
      const setPadding = setTimeout(() => {
        childRef.current.style.padding = "0px";
      }, 300);
      setActiveIndex(!activeIndex);
      return () => clearTimeout(setPadding);
    }
  };

  return (
    <div className={classes.accordion}>
      <div className={`${classes.accordionHeader} bg-blue`} onClick={() => onItemClick()}>
        <div className={classes.title}>{title}</div>
        <div>{extra}</div>
        <div className={classes.icon}>{activeIndex ? <CaretUpOutlined /> : <CaretDownOutlined />}</div>
      </div>

      <div ref={childRef} className={`${classes.content} ${activeIndex ? classes.show : classes.hide}`}>
        <div style={{ overflow: "hidden" }}>{children}</div>
      </div>
    </div>
  );
};

export default Accordion;
