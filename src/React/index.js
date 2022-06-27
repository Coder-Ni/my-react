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

const React = {
  createElement,
};

export default React;
