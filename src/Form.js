/**
 * 结合 Container validator，提供 validate 和 model 相关操作的 Form 容器
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { setBindValue, withoutProps } from './HOC/utils';
import { toJS, assign, replace, clear } from './store/';
import Container from './Container';
import refers from './refers';

// TODO 合并 Container 和 Form
export default class Form extends Component {
  static propTypes = {
    name: PropTypes.string,
    model: PropTypes.object,
    onSubmit: PropTypes.func,
  }

  static defaultProps = {
    onSubmit: () => { },
  }

  constructor(props) {
    super(props);
    const { name } = props;
    if (name) {
      if (refers[name]) {
        throw new Error(`已存在名为 ${name} 的 refer`);
      }
      refers[name] = this;
    }
  }

  componentDidMount() {
    const { model } = this.props;
    if (model) {
      this.stash(model);
    }
  }

  componentWillUnmount() {
    const { name } = this.props;
    delete refers[name];
  }

  onKeyPress = (e) => {
    if (e.nativeEvent.keyCode === 13) {
      this.props.onSubmit(e);
    }
  }

  submit = (...args) => {
    const { onSubmit } = this.props;
    if (typeof onSubmit === 'function') {
      onSubmit(...args);
    }
  }

  validate = (...args) => {
    const callback = args.pop();
    this.validator.validate(...args, () => {
      callback(this.model());
    });
  }

  unvalidate = () => {
    setTimeout(() => {
      this.validator.unvalidate();
    }, 0);
  }

  model = () => toJS(this.props.model)

  // 暂存 model 数据
  stash = () => {
    this.stashModel = this.model();
    return this;
  }

  // 重置为 stash 的 model
  reset = () => {
    replace(this.props.model, this.stashModel);
    this.unvalidate();
    return this;
  }

  clear = () => {
    clear(this.props.model);
    this.unvalidate();
    return this;
  }

  replace = (values) => {
    replace(this.props.model, values);
    this.unvalidate();
    return this;
  }

  assign = (values, value) => {
    const { model } = this.props;
    if (typeof values === 'string') { // 修改单个值
      setBindValue(model, values, value);
    } else {
      assign(model, values);
    }
    return this;
  }

  ref = (ref) => { this.validator = ref; }

  render() {
    const props = withoutProps(this.props, ['name']);
    return (
      <Container
        {...props}
        onSubmit={this.submit}
        onKeyPress={this.onKeyPress}
        ref={this.ref}
      />
    );
  }
}
