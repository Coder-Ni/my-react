import {TEXT_ELEMENT} from "../constants";

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
    this.internalFiber.updateQueue = new UpdateQueue()
    // this.updateQueue = new UpdateQueue();
  }
  setState(palyload) {
    let update = new Update(palyload);
    this.internalFiber.updateQueue.enqueueUpdate(update)
    // this.updateQueue.enqueueUpdate(update);
  }
}
Component.prototype.isReactComponent = {};

class Update {
  constructor(playload) {
    this.playload = playload;
  }
}

export class UpdateQueue {
  constructor() {
    this.firstUpdate = null;
    this.lastUpdate = null;
  }
  enqueueUpdate(update) {
    if (this.firstUpdate) {
      this.lastUpdate.nextUpdate = update;
      this.lastUpdate = update;
    } else {
      this.firstUpdate = update;
      this.lastUpdate = update;
    }
  }
  forceUpdate(state) {
    let currentUpdate = this.firstUpdate;
    while (currentUpdate) {
      if (currentUpdate) {
        let nextState =
          typeof currentUpdate.playload === "function"
            ? currentUpdate.playload(state)
            : currentUpdate.playload;
            state = {...state, ...nextState};
      }
      currentUpdate = currentUpdate.nextUpdate;
    }
    this.firstUpdate = this.lastUpdate = null;
    return state;
  }
}

const React = {
  createElement,
  Component,
  UpdateQueue
};

export default React;
