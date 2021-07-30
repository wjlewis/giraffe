export class Option<T> {
  private type: OptionType;
  private value?: T;

  static Some<T>(value: T): Option<T> {
    const out: Option<T> = new Option();
    out.type = OptionType.Some;
    out.value = value;
    return out;
  }

  static None<T>(): Option<T> {
    const out: Option<T> = new Option();
    out.type = OptionType.None;
    return out;
  }

  map<U>(fn: (value: T) => U): Option<U> {
    switch (this.type) {
      case OptionType.Some:
        return Option.Some(fn(this.value as T));
      case OptionType.None:
        return this as any as Option<U>;
    }
  }

  match<A>(match: OptionMatch<T, A>): A {
    switch (this.type) {
      case OptionType.Some:
        return match.some(this.value as T);
      case OptionType.None:
        return match.none();
    }
  }

  unwrap(): T {
    if (this.type === OptionType.None) {
      throw new Error('attempt to unwrap `None` variant of `Option`');
    }

    return this.value as T;
  }
}

enum OptionType {
  Some = 'Option.Some',
  None = 'Option.None',
}

interface OptionMatch<T, A> {
  some: (value: T) => A;
  none: () => A;
}
