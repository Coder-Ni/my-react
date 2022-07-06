import { TEXT_ELEMENT } from "../constants";
import { schedule, useReducer, useState } from "../schedule";
import { Update } from "../updateQueue";

/**
 * @param {*} type
 * @param {*} config
 * @param {*} children
 * @return {*}
 */
function createElement(type, config, ...children) {
  delete config.__self;
  delete config.__source;
  return {
    type,
    props: {
      ...config,
      children: children.map((item) => {
        return typeof item === "object"
          ? item
          : {
              type: TEXT_ELEMENT,
              props: {
                text: item,
                children: [],
              },
            };
      }),
    },
  };
}

class Component {
  constructor(props) {
    this.props = props;
    // this.updateQueue = new UpdateQueue();
  }
  setState(palyload) {
    let update = new Update(palyload);
    this.internalFiber.updateQueue.enqueueUpdate(update);
    // this.updateQueue.enqueueUpdate(update);
    schedule();
  }
}
Component.prototype.isReactComponent = {};

const React = {
  createElement,
  Component,
  useReducer,
  useState
};

export default React;
