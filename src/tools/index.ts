export * from './Vec';
export * from './Option';
export * from './Result';
export * from './Rect';

export function noOp(..._args: any[]) {}

export function arrayToObj<A extends IdAble>(xs: A[]): { [key: string]: A } {
  return xs.reduce((acc, x) => ({ ...acc, [x.id]: x }), {});
}

export interface IdAble {
  id: number;
}

export function xOrIn<A>(xs: A[], x: A): A[] {
  if (xs.includes(x)) {
    return xs.filter(x1 => x1 !== x);
  } else {
    return [...xs, x];
  }
}

export function classNames(...args: any[]): string {
  return args
    .map(arg => {
      if (arg && typeof arg === 'object') {
        return Object.keys(arg)
          .filter(key => arg[key])
          .map(key => String(key))
          .join(' ');
      } else {
        return String(arg);
      }
    })
    .join(' ');
}

export function dups<A>(xs: A[]): A[] {
  const seen: A[] = [];
  const dups: A[] = [];

  for (let x of xs) {
    if (seen.includes(x) && !dups.includes(x)) {
      dups.push(x);
    }

    seen.push(x);
  }

  return dups;
}
