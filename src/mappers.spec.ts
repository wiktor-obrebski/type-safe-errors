import { Err, Ok } from './result';

class Error1 {
  __brand: 'Error1';
}
class Error2 {
  __brand: 'Error2';
}
class Error3 {
  __brand: 'Error3';
}
class Error4 {
  __brand: 'Error4';
}

// # Input typical cases definion

interface Inputs {
  Ok: Ok<number>;
  Err: Err<Error1>;
  Mixed: Ok<number> | Err<Error1> | Err<Error2>;

  MultiOk: Ok<number> | Ok<string>;
  MultiErr: Err<Error1> | Err<Error2>;
  MultiOkMixed: Ok<number> | Ok<string> | Err<Error1> | Err<Error2>;
}

const inputs: Inputs = {
  Ok: Ok.of(123),
  Err: Err.of(new Error1()),

  // below value no matter, type matters
  Mixed: Ok.of(123),
  MultiOk: Ok.of('123'),
  MultiErr: Err.of(new Error1()),
  MultiOkMixed: Ok.of(123),
};

//// # Tests for inputs.Ok

// Ok<'123'>
const okForValue = inputs.Ok.map(v => '123' as const);

// Ok<'321'>
const okForResultOk = inputs.Ok.map(v => Ok.of('321' as const));

// Err<Error2>
const okForResultErr = inputs.Ok.map(v => Err.of(new Error2()));

// Err<Error1> | Err<Error2> | Ok<'567'>
const okForResultMixed = inputs.Ok.map(v =>
  Math.random() > 0
    ? Math.random() > 0
      ? Err.of(new Error1())
      : Err.of(new Error2())
    : Ok.of('567' as const)
);

//// # Tests for inputs.Err

// Err<Error1>
const errForValue = inputs.Err.map(v => '123' as const);

// Err<Error1>
const errForResultOk = inputs.Err.map(v => Ok.of('321' as const));

// Err<Error1>
const errForResultErr = inputs.Err.map(v => Err.of(new Error2()));

// Err<Error1>
const errForResultMixed = inputs.Err.map(v =>
  Math.random() > 0
    ? Math.random() > 0
      ? Err.of(new Error1())
      : Err.of(new Error2())
    : Ok.of('567' as const)
);

//// # Tests for inputs.Mixed

// Ok<'123'> | Err<Error1> | Err<Error2>
const mixedForValue = inputs.Mixed.map(v => '123' as const);

// Ok<'321'> | Err<Error1> | Err<Error2>
const mixedForResultOk = inputs.Mixed.map(v => Ok.of('321' as const));

// Err<Error1> | Err<Error2> | Err<Error3>
const mixedForResultErr = inputs.Mixed.map(v => Err.of(new Error3()));

// Ok<'567'> | Err<Error1> | Err<Error2> | Err<Error3> | Err<Error4>
const mixedForResultMixed = inputs.Mixed.map(v =>
  Math.random() > 0
    ? Math.random() > 0
      ? Err.of(new Error3())
      : Err.of(new Error4())
    : Ok.of('567' as const)
);

//// # Tests for inputs.MultiOk

// Ok<'123'>
const multiOkForValue = inputs.MultiOk.map(v => '123' as const);

// Ok<'321'>
const multiOkForResultOk = inputs.MultiOk.map(v => Ok.of('321' as const));

// Err<Error3>
const multiOkForResultErr = inputs.MultiOk.map(v => Err.of(new Error3()));

// Ok<'567'> | Err<Error3> | Err<Error4>
const multiOkForResultMixed = inputs.MultiOk.map(v =>
  Math.random() > 0
    ? Math.random() > 0
      ? Err.of(new Error3())
      : Err.of(new Error4())
    : Ok.of('567' as const)
);

//// # Tests for inputs.MultiErr

// Err<Error1> | Err<Error2>
const multiErrForValue = inputs.MultiErr.map(v => '123' as const);

// Err<Error1> | Err<Error2>
const multiErrForResultOk = inputs.MultiErr.map(v => Ok.of('321' as const));

// Err<Error1> | Err<Error2>
const multiErrForResultErr = inputs.MultiErr.map(v => Err.of(new Error3()));

// Err<Error1> | Err<Error2>
const multiErrForResultMixed = inputs.MultiErr.map(v =>
  Math.random() > 0
    ? Math.random() > 0
      ? Err.of(new Error3())
      : Err.of(new Error4())
    : Ok.of('567' as const)
);

//// # Tests for inputs.MultiOkMixed

// Ok<'123'> | Err<Error1> | Err<Error2>
const multiOkMixedForValue = inputs.MultiOkMixed.map(v => '123' as const);

// Ok<'321'> | Err<Error1> | Err<Error2>
const multiOkMixedForResultOk = inputs.MultiOkMixed.map(v =>
  Ok.of('321' as const)
);

// Err<Error1> | Err<Error2> | Err<Error3>
const multiOkMixedForResultErr = inputs.MultiOkMixed.map(v =>
  Err.of(new Error3())
);

// Ok<'567'> | Err<Error1> | Err<Error2> | Err<Error3> | Err<Error4>
const multiOkMixedForResultMixed = inputs.MultiOkMixed.map(v =>
  Math.random() > 0
    ? Math.random() > 0
      ? Err.of(new Error3())
      : Err.of(new Error4())
    : Ok.of('567' as const)
);
