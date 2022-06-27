export function setProps(dom, odlProps, newProps) {
  for (let key in odlProps) {
  }
  for (let key in newProps) {
    if (key !== "children") {
      setProp(dom, key, newProps[key]);
    }
  }
}

function setProp(dom, key, value) {
  if (/^on/.test(key)) {
    dom[key.toLowerCase()] = value;
  } else if (key === "style") {
    if (value) {
      for (let key in value) {
        dom.style[key] = value[key];
      }
    }
  } else {
    dom.setAttribute(key, value);
  }
}
