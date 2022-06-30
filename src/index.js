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
console.log(ele);
// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(element);

let render2 = document.getElementById("btn1");
render2.addEventListener("click", () => {
  let ele = (
    <div id="A1-new" style={style}>
      A1-new
      <div id="B1-new" style={style}>
        B1-new
        <div id="C1-new" style={style}>
          C1-new
        </div>
        <div id="C2-new" style={style}>
          C2-new
        </div>
      </div>
      <div id="B2-new" style={style}>
        B2-new
      </div>
      <div id="B3-new" style={style}>
        B3-new
      </div>
    </div>
  );
  ReactDOM.render(ele, document.getElementById("root"));
});

let render3 = document.getElementById("btn2");
render3.addEventListener("click", () => {
  let ele = (
    <div id="A1-new1" style={style}>
      A1-new1
      <div id="B1-new1" style={style}>
        B1-new
        <div id="C1-new1" style={style}>
          C1-new1
        </div>
        <div id="C2-new1" style={style}>
          C2-new1
        </div>
      </div>
      <div id="B2-new1" style={style}>
        B2-new1
      </div>
    </div>
  );
  ReactDOM.render(ele, document.getElementById("root"));
});

ReactDOM.render(ele, document.getElementById("root"));
