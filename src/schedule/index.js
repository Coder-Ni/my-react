import {
  TAG_HOST,
  TAG_ROOT,
  TAG_TEXT,
  TEXT_ELEMENT,
  PLACEMENT,
  UPDATE,
  DELETEMENT,
  TAG_CLASS,
  TAG_FUNCTION,
} from "../constants";
import { Update, UpdateQueue } from "../updateQueue";
import { setProps } from "../utils";

let nextUnitOfWork = null; // 下一个工作单元
let workInProgerssRoot = null; // 当前使用的fiber节点
let currentRoot = null;
let deletions = [];
let workInProgerssFiber = null;
let hookIndex = 0;

function schedule(rootFiber) {
  if (currentRoot && currentRoot.alternate) {
    workInProgerssRoot = currentRoot.alternate;
    workInProgerssRoot.alternate = currentRoot;
    if (rootFiber) {
      workInProgerssRoot.props = rootFiber.props;
    }
  } else if (currentRoot) {
    if (rootFiber) {
      rootFiber.alternate = currentRoot;
      workInProgerssRoot = rootFiber;
    } else {
      workInProgerssRoot = {
        ...currentRoot,
        alternate: currentRoot,
      };
    }
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
  } else if (currentFiber.tag === TAG_CLASS) {
    updateCLASS(currentFiber);
  } else if (currentFiber.tag === TAG_FUNCTION) {
    updateFUNCTION(currentFiber);
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

function updateCLASS(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = new currentFiber.type(currentFiber.props);
    currentFiber.stateNode.internalFiber = currentFiber;
    currentFiber.updateQueue = new UpdateQueue();
  }
  currentFiber.stateNode.state = currentFiber.updateQueue.forceUpdate(
    currentFiber.stateNode.state
  );
  let newElement = currentFiber.stateNode.render();
  const newChildren = [newElement];
  reconcilerChildren(newChildren, currentFiber);
  // schedule();
}

function updateFUNCTION(currentFiber) {
  workInProgerssFiber = currentFiber;
  hookIndex = 0;
  workInProgerssFiber.hooks = [];
  const newChildren = [currentFiber.type(currentFiber.props)];
  reconcilerChildren(newChildren, currentFiber);
}

function createDOM(currentFiber) {
  if (currentFiber.tag === TAG_TEXT) {
    return document.createTextNode(currentFiber.props.text);
  }
  if (currentFiber.tag === TAG_HOST) {
    let stateNode = document.createElement(currentFiber.type);
    updateDOM(
      stateNode,
      {},
      {
        ...currentFiber.props,
      }
    );
    return stateNode;
  }
}

function updateDOM(stateNode, odlProps, newProps) {
  if (stateNode && stateNode.setAttribute)
    setProps(stateNode, odlProps, newProps);
}

function reconcilerChildren(newChildren, currentFiber) {
  let currentIndex = 0;
  let preSibing; // 上一个子节点

  let oldFiber = currentFiber.alternate && currentFiber.alternate.child;
  if (oldFiber) {
    oldFiber.firstEffect = oldFiber.lastEffect = oldFiber.nextEffect = null;
  }

  while (currentIndex < newChildren.length || oldFiber) {
    let newChild = newChildren[currentIndex];
    let newFiber;
    let sameType = oldFiber && newChild && oldFiber.type === newChild.type;
    let tag;

    if (newChild && newChild.type === TEXT_ELEMENT) {
      tag = TAG_TEXT;
    } else if (newChild && typeof newChild.type === "string") {
      tag = TAG_HOST;
    } else if (
      newChild &&
      typeof newChild.type === "function" &&
      newChild.type.prototype.isReactComponent
    ) {
      tag = TAG_CLASS;
    } else if (newChild && typeof newChild.type === "function") {
      tag = TAG_FUNCTION;
    }

    if (sameType) {
      if (oldFiber.alternate) {
        newFiber = oldFiber.alternate;
        newFiber.props = newChild.props;
        newFiber.alternate = oldFiber;
        newFiber.effectTag = UPDATE;
        newFiber.nextEffect = null;
        newFiber.updateQueue = oldFiber.updateQueue || new UpdateQueue();
      } else {
        newFiber = {
          tag: oldFiber.tag,
          type: oldFiber.type,
          props: newChild.props,
          stateNode: oldFiber.stateNode,
          return: currentFiber,
          effectTag: UPDATE,
          nextEffect: null,
          alternate: oldFiber,
          updateQueue: oldFiber.updateQueue || new UpdateQueue(),
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
          updateQueue: new UpdateQueue(),
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
  let domTags = [TAG_ROOT, TAG_TEXT, TAG_HOST];
  while (!domTags.includes(returnFiber.tag)) {
    returnFiber = returnFiber.return;
  }

  let returnDOM = returnFiber.stateNode;
  if (currentFiber.effectTag === PLACEMENT) {
    let nextFiber = currentFiber;
    if (nextFiber.tag === TAG_CLASS) return;
    while (nextFiber.tag !== TAG_HOST && nextFiber.tag !== TAG_TEXT) {
      nextFiber = currentFiber.child;
    }
    returnDOM.appendChild(nextFiber.stateNode);
  } else if (currentFiber.effectTag === UPDATE) {
    if (currentFiber.type === TEXT_ELEMENT) {
      if (currentFiber.alternate.props.text !== currentFiber.props.text) {
        currentFiber.stateNode.textContent = currentFiber.props.text;
      }
    } else {
      if (currentFiber.tag !== TAG_CLASS) {
        updateDOM(
          currentFiber.stateNode,
          currentFiber.alternate.props,
          currentFiber.props
        );
      }
    }
  } else if (currentFiber.effectTag === DELETEMENT) {
    commitDelete(currentFiber, returnDOM);
    // returnDOM.removeChild(currentFiber.stateNode);
  }
  // currentFiber.effectTag = null;
}

function commitDelete(currentFiber, returnDOM) {
  if (currentFiber.tag === TAG_HOST || currentFiber.tag === TAG_TEXT) {
    returnDOM.removeChild(currentFiber.stateNode);
  } else {
    commitDelete(currentFiber.child, returnDOM);
  }
}

export function useReducer(reducer, initalValue) {
  let alternate = workInProgerssFiber.alternate;
  let newHook = alternate && alternate.hooks && alternate.hooks[hookIndex];
  if (newHook) {
    newHook.state = newHook.updateQueue.forceUpdate(newHook.state);
  } else {
    newHook = {
      state: initalValue,
      updateQueue: new UpdateQueue(),
    };
  }
  const dispatch = (action) => {
    let playload = reducer ? reducer(newHook.state, action) : action;
    newHook.updateQueue.enqueueUpdate(new Update(playload));
    schedule();
  };
  workInProgerssFiber.hooks[hookIndex++] = newHook;
  return [newHook.state, dispatch];
}

export { schedule };
