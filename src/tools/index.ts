export * from './Vec';
export * from './Option';
export * from './Rect';

export function noOp(..._args: any[]) {}

export function set(
  obj: { [key: string]: any },
  path: string[],
  value: any
): any {
  const out = { ...obj };
  let ref = obj;
  let wip = out;

  for (let i = 0; i < path.length; i++) {
    const segment = path[i];
    const refValue = ref[segment];
    wip[segment] =
      i === path.length - 1
        ? value
        : refValue && typeof refValue === 'object'
        ? { ...refValue }
        : {};
    wip = wip[segment];
    ref = ref[segment];
  }

  return out;
}

export function set1<A>(obj: any, path: (string | number)[], value: A): any {
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
        ...set1(inner, rest, value),
      },
    };
  }
}
