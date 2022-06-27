import {TAG_ROOT} from "../constants";
import {schedule} from "../schedule";

function render(element, container) {
  const rootFiber = {
    tag: TAG_ROOT,
    stateNode: container,
    props: {
      children: [element],
    },
  };
  schedule(rootFiber);
}

const ReactDOM = {
  render,
};

export default ReactDOM;
