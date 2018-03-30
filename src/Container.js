/**
 * 提供 model layout 功能的容器
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withoutProps } from './HOC/utils';
import validator from './HOC/validator';

@validator
class Container extends Component {
  static displayName = 'Container'

  /* eslint-disable */
  static propTypes = {
    view: PropTypes.bool,
    model: PropTypes.object,
    className: PropTypes.string,
    fieldClass: PropTypes.string,
    labelClass: PropTypes.string,
    wrapperClass: PropTypes.string,
  }

  static contextTypes = {
    model: PropTypes.object,
  }

  static childContextTypes = {
    view: PropTypes.bool,
    model: PropTypes.object,
    fieldClass: PropTypes.string,
    labelClass: PropTypes.string,
    wrapperClass: PropTypes.string,
  }
  /* eslint-enable */

  getChildContext() {
    const { props } = this;
    const context = {};
    // 空 context.xxx，自动继承上层 context.xxx
    ['view', 'model', 'fieldClass', 'labelClass', 'wrapperClass'].forEach((key) => {
      if (props[key]) {
        context[key] = props[key];
      }
    });
    return context;
  }

  render() {
    const props = withoutProps(this.props, ['view', 'model', 'fieldClass', 'labelClass', 'wrapperClass']);
    return (
      <div {...props} />
    );
  }
}
export default Container;

