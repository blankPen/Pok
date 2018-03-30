import { Component } from 'react';
import { autoBind } from './utils';
import { createCollector } from './collect';

function copyStaticProps(target, source) {
  target.displayName = source.displayName || source.name;
  target.contextTypes = source.contextTypes;
  target.childContextTypes = source.childContextTypes;
  target.propTypes = source.propTypes;
  target.defaultProps = source.defaultProps;
}

function toReactiveComp(Comp) {
  const isStatelessComp = typeof Comp === 'function' &&
    (!Comp.prototype || !Comp.prototype.render || !Comp.prototype.isReactComponent)
    && !Comp.isReactClass;

  if (isStatelessComp) {
    class NewComp extends Component {
      render() {
        return Comp.call(this, this.props, this.context);
      }
    }
    copyStaticProps(NewComp, Comp);
    return toReactiveComp(NewComp);
  }

  class ReactiveHOC extends Comp {
    constructor(props, context) {
      super(props, context);

      this.state = {
        updateKey: 0,
      };

      autoBind(this, Comp.prototype, true);
      this.render = createCollector(this.render, this.update.bind(this));
    }

    shouldComponentUpdate(nextProps, nextState) {
      const { props, state } = this;

      if (
        super.shouldComponentUpdate &&
        !super.shouldComponentUpdate(nextProps, nextState)
      ) {
        return false;
      }

      if (state.updateKey !== nextState.updateKey) {
        return true;
      }

      const keys = Object.keys(props);
      const nextKeys = Object.keys(nextProps);
      return (
        nextKeys.length !== keys.length ||
        nextKeys.some(key => props[key] !== nextProps[key])
      );
    }

    componentWillUnmount() {
      if (super.componentWillUnmount) {
        super.componentWillUnmount();
      }
      if (this.render.destory) this.render.destory();
    }

    update() {
      this.setState({ updateKey: this.state.updateKey + 1 });
    }
  }
  copyStaticProps(ReactiveHOC, Comp);
  return ReactiveHOC;
}

export default function view(Comp) {
  if (typeof Comp !== 'function') {
    throw new TypeError('view() expects a component as argument.');
  }
  return toReactiveComp(Comp);
}
