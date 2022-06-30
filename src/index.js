import React from "./React";

import ReactDOM from "./ReactDom";

// import React, {Component} from "react";
// import ReactDOM from "react-dom";

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      counter: 0,
    };
  }
  counterUp() {
    this.setState((state) => ({
      counter: state.counter + 1,
    }));
  }
  render() {
    return (
      <div>
        {this.state.counter}
        <div>
          <button
            onClick={() => {
              this.counterUp();
            }}
          >
            +
          </button>
        </div>
      </div>
    );
  }
}
ReactDOM.render(<Counter name="hello" />, document.getElementById("root"));
