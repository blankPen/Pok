/**
 * 包装组件为 validator 容器，增加 validate 验证方法
 * @param { Component } WrappedComponent 包装组件
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatic from 'hoist-non-react-statics';

export default function (WrappedComponent) {
  class Validator extends Component {
    static propTypes = {
      innerRef: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
      ]),
    }

    static childContextTypes = {
      container: PropTypes.object,
    }

    static contextTypes = {
      container: PropTypes.object,
    }

    constructor(props) {
      super(props);
      this.trigger = true; // 是否已触发验证，之后所有表单进行实时验证
      this.validators = [];
      this.containers = [];
    }

    getChildContext() {
      return {
        container: this,
      };
    }

    componentDidMount() {
      const { context } = this;
      if (context && context.container) {
        context.container.mountContainer(this);
      }
    }

    componentWillUnmount() {
      const { context } = this;
      if (context && context.container) {
        context.container.unmountContainer(this);
      }
    }

    mountValidator(validator) {
      this.validators.push(validator);
    }

    unmountValidator(validator) {
      const index = this.validators.indexOf(validator);
      if (index >= 0) {
        this.validators.splice(index, 1);
      }
    }

    mountContainer(container) {
      this.containers.push(container);
    }

    unmountContainer(container) {
      this.containers = this.containers.filter(item => item !== container);
    }

    validate = (callback) => { // 为了收集全部 message，所有验证器 都只 resolve，不 reject
      this.trigger = true; // TODO bug context 没有继承，嵌套时候可能没有自动校验
      const validators = this.validators.map(validator => validator());
      const containers = this.containers.map(container => container.validate());
      const promise = Promise.all([Promise.all(validators), Promise.all(containers)]);
      return promise.then((messages) => {
        const validatorMessages = messages[0].filter(item => !!item); // 过滤校验通过的空 message
        messages = messages[1].reduce((all, item) => all.concat(item), validatorMessages);
        if (messages.length === 0 && callback) {
          callback();
        }
        return messages;
      });
    }

    // 清除校验样式
    unvalidate = () => {
      this.validators.forEach(v => v.onClear());
      this.containers.forEach(v => v.unvalidate());
    }

    render() {
      const { innerRef, ...props } = this.props;
      if (innerRef) {
        props.ref = innerRef;
      }
      return <WrappedComponent {...props} />;
    }
  }

  hoistNonReactStatic(Validator, WrappedComponent);

  return Validator;
}
