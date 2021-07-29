export * from './Vec';
export * from './Option';
export * from './Rect';

export function noOp(..._args: any[]) {}

export function set<A>(obj: any, path: (string | number)[], value: A): any {
  if (path.length === 0) {
    return value;
  } else if (path.length === 1) {
    return {
      ...obj,
      [path[0]]: value,
    };
  } else {
    const [first, ...rest] = path;
    const inner =
      obj[first] && typeof obj[first] === 'object' ? obj[first] : {};

    return {
      ...obj,
      [first]: {
        ...inner,
        ...set(inner, rest, value),
      },
    };
  }
}
