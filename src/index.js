import React from "./React";

import ReactDOM from "./ReactDom";

// import React from "react";
// import ReactDOM from "react-dom";

let style = {
  border: "3px solid red",
  padding: "10px 5px",
};
let ele = (
  <div id="A1" style={style}>
    A1
    <div id="B1" style={style}>
      B1
      <div id="C1" style={style}>
        C1
      </div>
      <div id="C2" style={style}>
        C2
      </div>
    </div>
    <div id="B2" style={style}>
      B2
    </div>
  </div>
);

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(element);

ReactDOM.render(ele, document.getElementById("root"));
