/**
 * validatable 增加 validator 属性，使组件可验证
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { observable } from 'mobx';
// import { observer } from 'mobx-react';
import hoistNonReactStatic from 'hoist-non-react-statics';

// import validateRule from '../rule';
import { mergeClassName, deepEqual, format } from './utils';

// const { norequired } = validateRule;

function exec(validator, value, param) { // 执行单个验证器
  return new Promise((resolve, reject) => {
    function done(message) { // 同步、异步验证回调
      if (typeof message === 'string') {
        reject(format(message, param));
      } else {
        resolve();
      }
    }

    const { rule, message } = validator;

    // norequired 截断
    if ((value == null || value === '')) {
      // hack, 无错误退出
      reject();
    }

    if (typeof rule === 'function') {
      validator = rule;
    } else if (rule instanceof RegExp) {
      validator = v => rule.test(v);
    }

    const ret = validator(value, param, done);
    // 解析同步验证
    if (ret === true) {
      done();
    } else if (typeof ret === 'string') {
      done(ret);
    } else if (typeof message === 'string') {
      done(message);
    }
  });
}

// 单个验证器类型描述
const rulePropType = PropTypes.oneOfType([
  PropTypes.shape({
    rule: PropTypes.oneOfType([
      PropTypes.object, // 正则表达式
      PropTypes.func,
    ]),
    message: PropTypes.string.isRequired,
  }),
  PropTypes.func,
]);

export default option => (WrappedComponent) => {
  const valuePropName = option.value;

  // relatedProps ?
  // TODO validator 验证器实现时依赖其他数据，如何自动触发 validate，并 render
  @observer
  class Validatable extends Component {
    static displayName = `Validate(${option.displayName})`

    static propTypes = {
      itemClass: PropTypes.string,
      validator: PropTypes.oneOfType([
        rulePropType,
        PropTypes.arrayOf(rulePropType),
      ]),
    }

    static defaultProps = {
      itemClass: 'inline-block',
    }

    static contextTypes = {
      container: PropTypes.object,
      label: PropTypes.string,
    }

    constructor(props) {
      super(props);
      this.store = observable({ message: undefined });

      this.onValidate.onClear = this.onClear;
    }

    componentDidMount() {
      if (this.props.validator) {
        this.getContainer().mountValidator(this.onValidate);
      }
    }

    componentWillReceiveProps(nextProps) {
      const oldValidator = this.props.validator;
      const newValidator = nextProps.validator;
      if (oldValidator || newValidator) {
        const container = this.getContainer();
        if (oldValidator && !newValidator) { // 运行期卸载验证器
          container.unmountValidator(this.onValidate);
        } else if (!oldValidator && newValidator) { // 运行期添加验证器
          container.mountValidator(this.onValidate);
        }

        const nextValue = nextProps[valuePropName];
        const prevValue = this.props[valuePropName];

        if (deepEqual(nextValue, prevValue)) {
          return;
        }

        // container 调用过 validate 后，自动实时校验
        if (container.trigger) {
          this.store.message = undefined; // 校验前清除提示信息
          this.validate(nextProps);
        }
      }
    }

    componentWillUnmount() {
      if (this.props.validator) {
        this.getContainer().unmountValidator(this.onValidate);
      }
    }

    // 响应 container.validate 验证
    onValidate = () => this.validate(this.props)

    onClear = () => {
      this.store.message = null;
    }

    getContainer() {
      const { container } = this.context;
      if (!container) {
        throw new Error('validator 组件找不到 container 组件');
      }
      return container;
    }

    validate(props) { // 验证逻辑
      const { validator } = props;
      return new Promise((resolve) => {
        const done = (message) => {
          this.store.message = message;
          resolve(message); // Promise all undefined 会变为 null
        };

        const value = props[valuePropName];
        const rules = Array.isArray(validator) ? validator : [validator];

        if (props.disabled) { // 直接跳过验证，一般为 disabled hidden 等属性
          done();
        } else {
          const param = {
            name: this.context.label,
            props,
          };

          Promise.all(rules.map(rule => exec(rule, value, param)))
            .then(() => done())
            .catch(done);
        }
      });
    }

    render() {
      /* eslint-disable react/no-danger, no-unused-vars */
      const { validator, itemClass, ...props } = this.props;
      const { message } = this.store;
      return (
        <div className={mergeClassName(itemClass, message && 'pex-validator-error')}>
          <WrappedComponent {...props} />
          {message ? (
            <div className="pex-validator-error-message-wrapper">
              <div className="pex-validator-error-message" dangerouslySetInnerHTML={{ __html: message }} />
            </div>
          ) : null}
        </div>
      );
    }
  }

  hoistNonReactStatic(Validatable, WrappedComponent);

  return Validatable;
};
