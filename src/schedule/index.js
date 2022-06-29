import {
  TAG_HOST,
  TAG_ROOT,
  TAG_TEXT,
  TEXT_ELEMENT,
  PLACEMENT,
  UPDATE,
  DELETEMENT,
} from "../constants";
import {setProps} from "../utils";

let nextUnitOfWork = null; // 下一个工作单元
let workInProgerssRoot = null; // 当前使用的fiber节点
let currentRoot = null;
let deletions = [];

function schedule(rootFiber) {
  if (currentRoot && currentRoot.alternate) {
    workInProgerssRoot = currentRoot.alternate;
    workInProgerssRoot.props = rootFiber.props;
    workInProgerssRoot.alternate = currentRoot;
  } else if (currentRoot) {
    rootFiber.alternate = currentRoot;
    workInProgerssRoot = rootFiber;
  } else {
    workInProgerssRoot = rootFiber;
  }
  workInProgerssRoot.firstEffect =
    workInProgerssRoot.nextEffect =
    workInProgerssRoot.lastEffect =
      null;
  nextUnitOfWork = workInProgerssRoot;
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
    updateDOM(stateNode, {}, {...currentFiber.props});
    return stateNode;
  }
}
function updateDOM(stateNode, odlProps, newProps) {
  setProps(stateNode, odlProps, newProps);
}
function reconcilerChildren(newChildren, currentFiber) {
  let currentIndex = 0;
  let preSibing; // 上一个子节点

  let oldFiber = currentFiber.alternate && currentFiber.alternate.child;

  while (currentIndex < currentFiber.props.children.length || oldFiber) {
    let newChild = newChildren[currentIndex];
    let newFiber;

    let sameType = oldFiber && newChild && oldFiber.type === newChild.type;
    let tag;

    if (newChild && newChild.type === TEXT_ELEMENT) {
      tag = TAG_TEXT;
    } else if (newChild && typeof newChild.type === "string") {
      tag = TAG_HOST;
    }
    if (sameType) {
      if (oldFiber.alternate) {
        newFiber = oldFiber.alternate;
        newFiber.props = newChild.props;
        newFiber.alternate = oldFiber;
        newFiber.effectTag = UPDATE;
        newFiber.nextEffect = null;
      }else{
        newFiber = {
          tag: oldFiber.tag,
          type: oldFiber.type,
          props: newChild.props,
          stateNode: oldFiber.stateNode,
          return: currentFiber,
          effectTag: UPDATE,
          nextEffect: null,
          alternate: oldFiber,
        };
      }
      
    } else {
      if (newChild) {
        newFiber = {
          // tag: newChild && newChild.type === TEXT_ELEMENT ? TAG_TEXT : TAG_HOST,
          tag,
          type: newChild.type,
          props: newChild.props,
          stateNode: null,
          return: currentFiber,
          effectTag: PLACEMENT,
          nextEffect: null,
        };
      }
      if (oldFiber) {
        oldFiber.effectTag = DELETEMENT;
        deletions.push(oldFiber);
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibing;
    }

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
  deletions.forEach(commitWork);
  let currentFiber = workInProgerssRoot.firstEffect;
  while (currentFiber) {
    commitWork(currentFiber);
    currentFiber = currentFiber.nextEffect;
  }
  deletions.length = 0;
  currentRoot = workInProgerssRoot;
  workInProgerssRoot = null;
}
function commitWork(currentFiber) {
  if (!currentFiber) return;
  let returnFiber = currentFiber.return;
  let returnDOM = returnFiber.stateNode;
  if (currentFiber.effectTag === PLACEMENT) {
    returnDOM.appendChild(currentFiber.stateNode);
  } else if (currentFiber.effectTag === UPDATE) {
    if (currentFiber.type === TEXT_ELEMENT) {
      if (currentFiber.alternate.props.text !== currentFiber.props.text) {
        currentFiber.stateNode.textContent = currentFiber.props.text;
      }
    } else {
      updateDOM(
        currentFiber.stateNode,
        currentFiber.alternate.props,
        currentFiber.props
      );
    }
  } else if (currentFiber.effectTag === DELETEMENT) {
    returnDOM.removeChild(currentFiber.stateNode);
  }
  // currentFiber.effectTag = null;
}
export {schedule};
