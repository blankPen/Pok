import { isObservable } from '../store/';

export function withoutProps(obj, keys) {
  const target = {};
  Object.keys(obj).forEach((key) => {
    if (keys.indexOf(key) < 0) {
      target[key] = obj[key];
    }
  });
  return target;
}

export function withProps(obj, keys) {
  const target = {};
  Object.keys(obj).forEach((key) => {
    if (keys.indexOf(key) >= 0) {
      target[key] = obj[key];
    }
  });
  return target;
}
/**
 * 从 onChange 的 event 中获取 value
 * @param {*} e
 */
export function getValueFromEvent(e) {
  if (!e || !e.target) {
    return e;
  }
  const { target } = e;
  return target.type === 'checkbox' ? target.checked : target.value;
}

/**
 * 将 bindName 格式处理 a.b,x.y.z 转换为 ['a.b', 'x.y.z']
 * @param {*} name
 */
function processBindName(name) {
  if (typeof name === 'string') {
    return name.indexOf(',') > 0 ? name.split(',') : name;
  }
  return name;
}

export function getBindValue(model, bindName) {
  if (!isObservable(model)) {
    throw new Error(`model 必须是 observable，bindName: ${bindName}`);
  }
  bindName = processBindName(bindName);
  if (Array.isArray(bindName)) {
    return bindName.map(name => model.get(name));
  }
  return model.get(bindName);
}

export function setBindValue(model, bindName, value) {
  if (!isObservable(model)) {
    throw new Error(`model 必须是 observable，bindName: ${bindName}`);
  }
  bindName = processBindName(bindName);
  if (Array.isArray(bindName)) {
    bindName.forEach((name, index) => model.set(name, value[index]));
  } else {
    model.set(bindName, value);
  }
}
