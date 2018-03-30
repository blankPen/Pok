const COLLECT_MAP = new WeakMap();
const UPDATE_LIST = new WeakSet();
const WAIT_COLLECT_LIST = new Set();
const WAIT_RUNNER_LIST = new Set();

/**
 * 创建收集者
 * 每次收集者呗执行时去收集指定函数中所引用过的Observe对象，并和update函数关联
 * @param {*} func 要收集的函数 => 一般来说render
 * @param {*} update 更新函数，用来强制更新组件
 */
export function createCollector(func, update) {
  function collector(...args) {
    WAIT_COLLECT_LIST.clear();
    const res = func.apply(this, args);
    registUpdateToCollect(update);
    return res;
  }
  // collector.forceUpdate = update;
  UPDATE_LIST.add(update);
  collector.destory = () => {
    UPDATE_LIST.delete(update);
  };
  return collector;
}

// 将update方法和被收集的对象和key关联
export function registUpdateToCollect(update) {
  WAIT_COLLECT_LIST.forEach(([target, key]) => {
    const objKeyMap = COLLECT_MAP.get(target) || {};
    objKeyMap[key] = objKeyMap[key] || new Set();
    objKeyMap[key].add(update);
    COLLECT_MAP.set(target, objKeyMap);
  });
  WAIT_COLLECT_LIST.clear();
}

// 添加对象和key到待收集列表
export function addCollectKeys(target, key) {
  WAIT_COLLECT_LIST.add([target, key]);
}

// 添加对象和key到待执行
export function addRunnerKeys(target, key) {
  const objKeyMap = COLLECT_MAP.get(target) || {};
  const arr = objKeyMap[key] || [];
  arr.forEach((update) => {
    WAIT_RUNNER_LIST.add(update);
  });
}

let BLOCK_APPLY = false;
// 执行所有待执行的update函数
export function apply(func) {
  if (BLOCK_APPLY) return;
  if (typeof func === 'function') {
    BLOCK_APPLY = true;
    func();
    BLOCK_APPLY = false;
    apply();
  } else {
    WAIT_RUNNER_LIST.forEach((update) => {
      if (UPDATE_LIST.has(update)) { // 如果已经销毁则不执行
        update();
      }
    });
    WAIT_RUNNER_LIST.clear();
  }
}
