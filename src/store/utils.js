const reactInternals = new Set([
  'constructor',
  'render',
  'componentWillMount',
  'componentDidMount',
  'componentWillReceiveProps',
  'shouldComponentUpdate',
  'componentWillUpdate',
  'componentDidUpdate',
  'componentWillUnmount',
]);

export function autoBind(context, proto, isReact) {
  Object.getOwnPropertyNames(proto).forEach((key) => {
    const { value } = Object.getOwnPropertyDescriptor(proto, key);
    if (typeof value === 'function' && !(isReact && reactInternals.has(key))) {
      context[key] = value.bind(context);
    }
  });
}
