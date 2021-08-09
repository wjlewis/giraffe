export class Result<A, E> {
  private type: ResultType;
  private ok?: A;
  private err?: E;

  static Ok<A, E>(ok: A): Result<A, E> {
    const out = new Result<A, E>();
    out.type = ResultType.Ok;
    out.ok = ok;
    return out;
  }

  static Err<A, E>(err: E): Result<A, E> {
    const out = new Result<A, E>();
    out.type = ResultType.Err;
    out.err = err;
    return out;
  }

  match<T>(match: ResultMatch<E, A, T>): T {
    switch (this.type) {
      case ResultType.Ok:
        return match.ok(this.ok as A);
      case ResultType.Err:
        return match.err(this.err as E);
    }
  }
}

enum ResultType {
  Ok = 'Ok',
  Err = 'Err',
}

interface ResultMatch<E, A, T> {
  ok: (ok: A) => T;
  err: (err: E) => T;
}
