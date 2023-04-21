import React, { useRef } from "react";
import kofiWidget2 from "./widget";

const KofiButton = ({ title, color, kofiID }) => {
  const { current: KofiWidget2 } = useRef(kofiWidget2());

  KofiWidget2.init(title, color, kofiID);

  return React.createElement(
    "div",
    { dangerouslySetInnerHTML: { __html: KofiWidget2.getHTML() } }
  );
};

export { KofiButton as default };