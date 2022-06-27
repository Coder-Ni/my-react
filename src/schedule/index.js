import {
  TAG_HOST,
  TAG_ROOT,
  TAG_TEXT,
  TEXT_ELEMENT,
  PLACEMENT,
} from "../constants";
import { setProps } from "../utils";

let nextUnitOfWork = null; // 下一个工作单元
let workInProgerssRoot = null; // 当前使用的fiber节点

function schedule(rootFiber) {
  nextUnitOfWork = rootFiber;
  workInProgerssRoot = rootFiber;
  requestIdleCallback(workLoop);
}

/**
 *
 * @param {requestIdleCallback返回的参数} deadline
 */
function workLoop(deadline) {
  let shouldYield = false; // 是否让出时间片
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() > 1;
  }

  if (!nextUnitOfWork) {
    console.log("reder结束");
    commitRoot();
  } else {
    requestIdleCallback(workLoop);
  }
}

/**
 *
 * @param {当前工作单元} currentFiber
 */
function performUnitOfWork(currentFiber) {
  beginWork(currentFiber);
  if (currentFiber.child) {
    return currentFiber.child;
  }
  while (currentFiber) {
    completeUnitOfWork(currentFiber);
    if (currentFiber.sibing) {
      return currentFiber.sibing;
    }
    currentFiber = currentFiber.return;
  }
}

function beginWork(currentFiber) {
  if (currentFiber.tag === TAG_ROOT) {
    updateHostRoot(currentFiber);
  } else if (currentFiber.tag === TAG_TEXT) {
    updateHostText(currentFiber);
  } else if (currentFiber.tag === TAG_HOST) {
    updateHost(currentFiber);
  }
}
function updateHostRoot(currentFiber) {
  let newChildren = currentFiber.props.children;
  reconcilerChildren(newChildren, currentFiber);
}
function updateHostText(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber);
  }
}
function updateHost(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber);
  }
  let newChildren = currentFiber.props.children;
  reconcilerChildren(newChildren, currentFiber);
}
function createDOM(currentFiber) {
  if (currentFiber.tag === TAG_TEXT) {
    return document.createTextNode(currentFiber.props.text);
  }
  if (currentFiber.tag === TAG_HOST) {
    let stateNode = document.createElement(currentFiber.type);
    updateDOM(stateNode, {}, { ...currentFiber.props });
    return stateNode;
  }
}
function updateDOM(stateNode, odlProps, newProps) {
  setProps(stateNode, odlProps, newProps);
}
function reconcilerChildren(newChildren, currentFiber) {
  let currentIndex = 0;
  let preSibing; // 上一个子节点
  while (currentIndex < currentFiber.props.children.length) {
    let newChild = newChildren[currentIndex];

    let newFiber = {
      tag: newChild.type === TEXT_ELEMENT ? TAG_TEXT : TAG_HOST,
      type: newChild.type,
      props: newChild.props,
      stateNode: null,
      return: currentFiber,
      effectTag: PLACEMENT,
      nextEffect: null,
    };

    if (newFiber) {
      if (currentIndex === 0) {
        currentFiber.child = newFiber; // index为0的时候是父fiber的第一个子元素,即使child
      } else {
        preSibing.sibing = newFiber; // index不为0的时候是父fiber child的兄弟元素
      }
      //   preSibing = newChild;  // 老师写错了
      preSibing = newFiber;
    }
    currentIndex++;
  }
}
function completeUnitOfWork(currentFiber) {
  let returnFiber = currentFiber.return;
  if (returnFiber) {
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = currentFiber.firstEffect;
    }
    if (currentFiber.lastEffect) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber.firstEffect;
      }
      // else {
      //   returnFiber.lastEffect = currentFiber.lastEffect;
      // }
      returnFiber.lastEffect = currentFiber.lastEffect;
    }
    const effectTag = currentFiber.effectTag;
    if (effectTag) {
      if (!!returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber;
      } else {
        returnFiber.firstEffect = currentFiber;
      }
      returnFiber.lastEffect = currentFiber;
    }
  }
}
function commitRoot() {
  let currentFiber = workInProgerssRoot.firstEffect;
  while (currentFiber) {
    commitWork(currentFiber);
    currentFiber = currentFiber.nextEffect;
  }
  workInProgerssRoot = null;
}
function commitWork(currentFiber) {
  if (!currentFiber) return;
  let returnFiber = currentFiber.return;
  let returnDOM = returnFiber.stateNode;
  if (currentFiber.effectTag === PLACEMENT) {
    returnDOM.appendChild(currentFiber.stateNode);
  }
  console.log(workInProgerssRoot);
  // currentFiber.effectTag = null;
}
export { schedule };
