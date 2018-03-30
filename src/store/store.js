import { autoBind } from './utils';
import { addCollectKeys, addRunnerKeys, apply } from './collect';

const rawToProxy = new WeakMap();
const proxyToRaw = new WeakMap();

export function isObservable(obj) {
  return proxyToRaw.has(obj);
}

export function toJS(obse) {
  if (proxyToRaw.has(obse)) return proxyToRaw.get(obse);
  return obse;
}

function get(target, key, receiver) {
  const result = Reflect.get(target, key, receiver);

  if (typeof key === 'symbol' || typeof result === 'function') { // func不进行observe
    return result;
  }

  target = proxyToRaw.get(target) || target;

  addCollectKeys(target, key);

  if (rawToProxy.has(result)) { // 判断是不是Observe对象
    return rawToProxy.get(result);
  }

  if (typeof result === 'object' && result !== null) {
    return observable(result);
  }

  return result;
}

function set(target, key, value, receiver) {
  if (typeof value === 'object' && value !== null) {
    value = proxyToRaw.get(value) || value;
  }
  const valueChanged = value !== target[key];
  const prevLength = Array.isArray(target) && target.length;
  const result = Reflect.set(target, key, value, receiver);
  const lengthChanged = prevLength !== false && prevLength !== target.length;

  /**
   * ? 这里本来应该可以根据proxyToRaw判断被set的对象有没有Observe过
   * ? 但是被Observe过的对象可能再继承其他属性，所以这里判断被Observe过的是不是同一个对象
   * ! if (proxyToRaw.has(receiver))
   */

  if (target === proxyToRaw.get(receiver)) {
    if (valueChanged) {
      addRunnerKeys(target, key);
    }

    if (lengthChanged) {
      addRunnerKeys(target, 'length');
    }

    if (valueChanged || lengthChanged) {
      apply();
    }
  }

  return result;
}

function createObservable(obj) {
  const proxy = new Proxy(obj, {
    get,
    set,
  });
  proxyToRaw.set(proxy, obj);
  rawToProxy.set(obj, proxy);
  return proxy;
}


function observable(obj = {}) {
  if (typeof obj !== 'object') {
    throw new TypeError('observable argument must be object or undefind');
  }
  if (proxyToRaw.has(obj)) {
    return obj;
  }
  if (rawToProxy.has(obj)) {
    return rawToProxy.get(obj);
  }
  return createObservable(obj);
}

function setValueByPath(obj, path, value) {
  if (!Array.isArray(path)) {
    path = path.split('.');
  }
  const key = path.shift();
  if (path.length > 0) {
    if (!obj[key]) {
      obj[key] = {};
    }
    setValueByPath(obj[key], path, value);
  } else {
    obj[key] = value;
  }
}

function getValueByPath(obj, path) {
  if (!Array.isArray(path)) {
    path = path.split('.');
  }
  const value = obj[path.shift()];
  if (value && path.length > 0) {
    return getValueByPath(value, path);
  }
  return value;
}

export function assign(model, values = {}) {
  Object.keys(values).forEach((key) => {
    model[key] = values[key];
  });
}

export function replace(model, values) {
  if (!isObservable(model)) {
    throw new Error('model 必须是 observable');
  }
  Object.keys(model).forEach(key => !(key in values) && delete model[key]);
  Object.keys(values).forEach((key) => { model[key] = values[key]; });
}

export function clear(model) {
  if (!isObservable(model)) {
    throw new Error('model 必须是 observable');
  }
  Object.keys(model).forEach((key) => {
    delete model[key];
  });
}


export default function store(obj = {}) {
  const observableStore = observable(obj);
  autoBind(observableStore, obj, false);
  Object.assign(observableStore, {
    set: setValueByPath.bind(null, observableStore),
    get: getValueByPath.bind(null, observableStore),
  });
  return observableStore;
}
