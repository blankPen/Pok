import React, { Component } from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatic from 'hoist-non-react-statics';

import { setBindValue, getBindValue, getValueFromEvent } from './utils';
import { view } from '../store/';

export default function (WrappedComponent) {
  const { displayName } = WrappedComponent;
  // value: 'value',
  // duplex: false,
  // observablePropNames: [],
  // propNames: ['visible', 'disabled'],
  const valuePropName = 'value';

  class Bind extends Component {
    static displayName = `Bind(${displayName})`

    static propTypes = {
      bind: PropTypes.oneOfType([
        PropTypes.string, // name base.name
        PropTypes.arrayOf(PropTypes.string), // ['dateFrom', 'dateTo']
        PropTypes.object, // 还没有完成。。。
      ]),
      onChange: PropTypes.func,
    }

    static defaultProps = {
      onChange: v => v,
      bind: undefined,
    }

    static contextTypes = {
      model: PropTypes.object,
    }

    constructor(props, context) {
      super(props, context);
      const { model } = context;
      const { bind } = props;
      this.defaultValuePropName = `default${valuePropName.slice(0, 1).toUpperCase()}${valuePropName.slice(1)}`;
      const defaultValue = props[this.defaultValuePropName];
      if (model && bind && defaultValue !== undefined) {
        // 自动同步 defaultValue 到 model
        setBindValue(model, bind, defaultValue);
      }
    }

    shouldComponentUpdate() { // TODO 可以增加 context diff，优化性能
      return true;
    }

    onChange(e) {
      const { bind, onChange } = this.props;
      // TODO not good onChange 冒泡
      setBindValue(this.context.model, bind, getValueFromEvent(e));
      onChange(e);
    }

    getBindValue(propName, bindName) {
      const { model } = this.context;
      if (!model) {
        throw new Error(`绑定属性[${bindName}]找不到上层组件的 model 属性`);
      }
      const value = getBindValue(model, bindName);
      return value;
    }

    render() {
      const { bind, ...props } = this.props;
      if (bind) {
        if (valuePropName in props) {
          throw new Error(`使用 bind 时不能再使用 ${valuePropName}`);
        }
        props[valuePropName] = this.getBindValue(valuePropName, bind);
        if (this.defaultValuePropName in props) {
          delete props[this.defaultValuePropName];
        }
        props.onChange = this.onChange;
      }
      return <WrappedComponent {...props} />;
    }
  }

  hoistNonReactStatic(Bind, WrappedComponent);

  return view(Bind);
}
