# API Reference

`type-safe-errors` exposes three class-like abstractions: [Ok](#ok), [Err](#err), and [Result](#result).

For an introduction to the type-safe-errors library and its benefits, please refer to the [README](../README.md).  For framework-specific examples, please refer to the [Framework Examples](../examples) directory.
## Ok
An `Ok` object represents a valid result of an action.

### Ok.of(...)

Creates a new `Ok` result. It is a static function, meaning it can only be called on the imported `Ok` namespace and not on `Ok` result instances.


The operation is the results version of [Promise.resolve](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve) function.

**Signature:**

```typescript
Ok.of<TValue>(value: TValue): Ok<TValue>
```

**Examples:**

```typescript
import { Ok } from 'type-safe-errors';

const okResult = Ok.of({
  name: 'John',
  surname: 'Doe'
});

// you can force Ok type by providing first generic argument
const okString = Ok.of<string>('Joe Doe');
```

---

### ok.map(callback)

Transforms an `Ok` result into a different result using the provided callback function. This interface is common for both `Ok` and `Err` results: [result.map(callback)](#resultmapcallback)

The operation is the results version of [Promise.prototype.then](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) function.

**Examples:**

```ts
import { Ok } from 'type-safe-errors';

const okResult = Ok.of(5);
// Ok.of(10)
const doubledOkResult = okResult.map(value => value * 2); 
```

Note: If an unexpected error is thrown within the callback function, it will be wrapped in an `UnknownError` and passed to the `mapErr` or `mapAnyErr` function if they are in the chain. If not handled, it will result in a rejected promise.

```ts
import { Ok, UnknownError } from 'type-safe-errors';

Ok.of(5)
  .map(val => {
    throw new Error('Problem!');
  })
  .mapErr(UnknownError, err => console.error(err.cause));
```



---

### ok.mapErr(ErrorClass, callback)

No operation is performed for `Ok` results. This interface is common for both `Ok` and `Err` results: [result.mapErr(ErrorClass, callback)](#resultmaperrerrorclass-callback)

**Examples:**

```ts
import { Ok } from 'type-safe-errors';
import { UserNotFoundError } from './errors';

const okResult = Ok.of(5);
// No operation is performed, the original Ok result is returned
const sameOkResult = okResult.mapErr(UserNotFoundError, err => 123); 

```

Note: You can handle unexpected errors that happened before in the Result chain by using `UnknownError` class:


```ts
import { Ok, UnknownError } from 'type-safe-errors';

Ok.of(5)
  .map(val => {
    throw new Error('Problem!');
  })
  .mapErr(UnknownError, err => console.error(err.cause));
```


---

### ok.mapAnyErr(callback)

Do nothing for `Ok` results.
Interface common for both types of results: [result.mapAnyErr(callback)](#resultmapanyerrcallback)

The operation is the results version of [Promise.prototype.catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) function.

**Examples:**

```ts
import { Ok } from 'type-safe-errors';

const okResult = Ok.of(5);
// No operation is performed, the original Ok result is returned
const sameOkResult = okResult.mapAnyErr(err => 123); 

```

Note: If an unexpected error is thrown before in the Result chain, it will be wrapped in an `UnknownError` and passed to this function:

```ts
import { Ok, UnknownError } from 'type-safe-errors';

Ok.of(5)
  .map(val => {
    throw new Error('Problem!');
  })
  // error is type `UnknownError`
  .mapAnyErr(err => console.error(err.cause));
```

---

### ok.promise()

Map an `Ok` result to a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). The promise will resolve with the original `Ok` result value.

This function is intentionally unavailable for `Err` results to help detect unhandled `Err` results that might appear in the results chain later on.

**Signature:**

```typescript
Ok<TOk>.promise(): Promise<TOk>
```

**Examples:**

```typescript
import { Ok, Err } from 'type-safe-errors';
import { UserNotFoundError } from './errors';

async function promiseResolver() {
  const number5 = await Ok.of(5).promise();

  // The line below will not compile, providing quick feedback about the issue
  await Err.of(new UserNotFoundError()).promise();
}
```

---

### ok.unsafePromise()

Map an `Ok` result to a fulfilled [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).  
This is a common interface for both `Ok` and `Err` results: [result.unsafePromise()](#resultunsafePromise).

**Examples:**

```typescript
import { Ok } from 'type-safe-errors';

const okResult = Ok.of(5);
const fulfilledPromise = okResult.unsafePromise(); // Promise resolves with value 5
```

---


## Err
An `Err` object represents an invalid result of an action.

### Err.of(...)

Creates a new `Err` result. It is a static function, meaning it can only be called on the imported `Err` namespace and not on `Err` result instances.

The operation is the results version of [Promise.reject](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject) function.

**Signature:**

```typescript
Err.of<TError>(value: TError): Err<TError>
```

**Examples:**

```typescript
import { Err } from 'type-safe-errors';

class UserNotFoundError extends Error {
  private __brand!: never;
}

const errResult = Err.of(new UserNotFoundError());
```

Error objects must be branded, by e.g.:
`private __brand!: never;`

Type branding is a technique used to create nominal (distinct) types in TypeScript. By adding a unique dummy private field to a class, you can differentiate it from other types that share the same structure. Without it, many error classes would be indistinguishable from TypeScript's perspective, which could lead to runtime issues.

---

### err.map(callback)

No operation is performed for `Err` results. This interface is common for both `Ok` and `Err` results: [result.map(callback)](#resultmapcallback)

**Examples:**

```ts
import { Ok } from 'type-safe-errors';
import { UserNotFoundError } from './errors';

const errResult = Err.of(new UserNotFoundError());
// No operation is performed, the original Err result is returned
const sameErrResult = errResult.map(err => 123); 
```

---

### err.mapErr(ErrorClass, callback)

Map the `Err` result of specified class to a different result. 
If you don't explicitly return value of `Err` type it will be mapped to `Ok`.  
Interface common for both types of results: [result.mapErr(ErrorClass, callback)](#resultmaperrerrorclass-callback)

**Examples:**

```ts
import { Ok } from 'type-safe-errors';
import { UserNotFoundError, Http404Error } from './errors';

const errResult = Err.of(new UserNotFoundError());

// Ok.of('User not found')
const okStringResult = errResult.mapErr(UserNotFoundError, err => 'User not found'); 

// Err result of Http404Error is returned
const httpErrResult = errResult.mapErr(UserNotFoundError, err => Err.of(new Http404Error())); 
```

---

### err.mapAnyErr(callback)

Map any `Err` result to a different result.
If you don't explicitly return value of `Err` type it will be mapped to `Ok`.  
Interface common for both types of results: [result.mapAnyErr(callback)](#resultmapanyerrcallback)

**Examples:**

```ts
import { Ok } from 'type-safe-errors';
import { UserNotFoundError, Http404Error } from './errors';

const errResult = Err.of(new UserNotFoundError());

// Ok.of('User not found')
const okStringResult = errResult.mapAnyErr(err => 'User not found'); 

// Err result of Http404Error is returned
const httpErrResult = errResult.mapAnyErr(err => Err.of(new Http404Error())); 
```
---

### err.unsafePromise()

Map an `Err` result to a rejected [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). This is a common interface for both `Ok` and `Err` results: [result.unsafePromise()](#resultunsafePromise).

**Examples:**

```typescript
import { Err } from 'type-safe-errors';
import { UserNotFoundError } from './errors';

const errResult = Err.of(new UserNotFoundError());
// Promise rejects with value of UserNotFoundError error instance
const rejectedPromise = errResult.unsafePromise();

```

---

## Result

`Result` provides static utility functions to work with multiple results.

### Result.combine([result1, result2, ...])

Combines a list of provided results into a single result.
The results can be either `Result` instances or promises that resolve to `Result` instances.
If all provided results are `Ok`, the returned result
will be an `Ok` containing an array of values from the provided results: `[Ok<A>, Ok<B>] -> Ok<[A, B]>`.  

If provided results list have at least one `Err` result,
returned result will be `Err` of first `Err` result value found in the array.

The `Result.combine` operation is the results version of [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) function.

**Signature:**

```typescript
type AsyncResult<TOk, TErr> = Promise<Result<TOk, TErr>> | Result<TOk, TErr>;

Result.combine(results: [AsyncResult<A, Err1>, AsyncResult<B, Err2>, ...]): Result<[A, B, ...], Err1 | Err2>
```

**Examples:**

Successful example

```typescript
import { Ok, Result } from 'type-safe-errors';

const ok1Result = Ok.of(5);
const ok2ResultFactory = async () => Ok.of(9);

const okSumResult = Result.combine([ok1Result, ok2ResultFactory()]).map(
  ([val1, val2]) => val1 + val2
)
```

An error example

```typescript
import { Ok, Result } from 'type-safe-errors';
import { UserNotFoundError } from './errors';

const ok1Result = Ok.of(5);
const ok2Result = Ok.of(9);
const errResult = Err.of(new UserNotFoundError());

const okSumResult = Result.combine([ok1Result, errResult, ok2Result])
  // not called, val2 is `never` type as we already know its an error
  .map(([val1, val2, val3]) => val1 + val3)
  // called
  .mapErr(UserNotFoundError, err => console.log('User not found!'))
```

More complicated example, with dynamic `Result`' types':

```typescript
const ok1Result = Ok.of(1);
const ok2Result = Ok.of(2);

const maybeErr1Result = Ok.of(5).map(
  () => Math.random() > 0.5 ? Err.of(new Error1()) : 5
);

const maybeErr2ResultFactory = async () => Ok.of(6).map(
  () => Math.random() > 0.5 ? Err.of(new Error2()) : 6
);

const okSumResult = Result.combine([
  ok1Result,
  maybeErr1Result,
  ok2Result,
  maybeErr2ResultFactory()
])
  // randomly, when all results all success, map will run
  .map(([val1, val5, val2, val6]) => val1 + val5 + val2 + val6)
  // if some of results fail, then mapAnyErr is called. `err` is Error1 or Error2 class
  .mapAnyErr(err => console.log('something goes wrong'));

// typeof okSumResult === Result<[1, 5, 2, 6], Error1 | Error2>.
```

---

### Result.from(resultFactory)

Wrap provided factory function into single result. The function can be async or sync. It is useful to start the result chain.  

All `Err` results returned by the factory function will be mapped to exactly same error result. All other values (`Ok` results and raw JavaScipt structures) will be mapped to `Ok` result.

**Signature:**

```typescript
// sync version
Result.from(factory: () => Result<U> | V): Result<U> | Ok<V>
// async version
Result.from(factory: () => Promise<Result<U> | V>): Result<U> | Ok<V>
```

**Examples:**

```typescript
import { Result, Err } from 'type-safe-errors';

const fetchOkResult = Result.from(async () => fetchRemoteData());

class FetchFailedError extends Error {
  private __brand!: never;
}

const fetchDataOrErrorResult = Result.from(async () => {
  const res = fetchRemoteData();
  if (res.ok) {
    return res.data;
  } else {
    return Err.of(new FetchFailedError());
  }
});
```

Note: If an unexpected error is thrown within the `resultFactory` function, it will be wrapped in an `UnknownError` and passed to the `mapErr` or `mapAnyErr` function if they are in the chain. If not handled, it will result in a rejected promise when using either [ok.promise()](#okpromise) or [result.unsafePromise()](#resultunsafePromise).

```ts
import { Result, UnknownError } from 'type-safe-errors';

Result.from(() => {
  throw new Error('Problem!');
})
  .mapErr(UnknownError, err => console.error(err.cause));

```

---

## resultify
`resultify` is a helper function akin to [Node.js's utils.promisify](https://nodejs.org/api/util.html#utilpromisifyoriginal).
It modifies the return type of any given function, synchronous or asynchronous, to `Result`.


**Examples:**

```typescript
import { Result, Err, resultify } from 'type-safe-errors';

class FetchFailedError extends Error {
  private __brand!: never;
}

async function fetchDataOrErrorResult () {
  try {
    const res = await fetchRemoteData();
    return res.data;
  } catch (err) {
    console.log(err);
    return Err.of(new FetchFailedError());
  }
};

const fetchRemoteDataAsResult = resultify(fetchDataOrErrorResult);
fetchRemoteDataAsResult()
  .map(data => data)
  .mapErr(FetchFailedError, (err) => console.log(err));
```

## Results common interface
`Ok` and `Err` are both considered results and share a common interface.

### result.map(callback)

Map the given `Ok` result to another result. 

**Signature:**

```typescript
// if `callback` return a value, the `map` function will return Ok.of(value)
Ok<TOk>.map<TReturn>(callback: (value: TOk) => TReturn): Ok<TReturn>

// if `callback` return a `Result`, the `map` function will return given `Result`
Ok<TOk>.map<TReturnResult>(callback: (value: TOk) => TReturnResult): TReturnResult

// called on an `Err` `map` function will return origin `Err` (the `callback` won't be called)
Err<TErr>.map<unknown>(callback: (value: never) => never): Err<TErr>;
```

**Examples:**

```typescript
import { Ok, Err } from 'type-safe-errors';

class UserNotFoundError extends Error {
  private __brand!: never;
}

const okOfNumber5 = Ok.of(10).map(value => value / 2);

const errOfUserNotFound = Ok.of(10).map(value => Err.of(new UserNotFoundError()));

const originErr = Err.of(new UserNotFoundError());
const sameOriginErr = originErr.map(val => val + 5);
```

---

### result.mapErr(ErrorClass, callback)

Map the `Err` result of the given class to another result. 

**Signature:**

```typescript
// if `Err` result is instance of `classType` and the `callback` return a value, the `mapErr` function will return Ok.of(value)
Err<TErr>.mapErr<TClass, TReturn>(classType: TClass, callback: (value: TErr) => TReturn): Ok<TReturn>

// if `Err` result is instance of `classType` and the `callback` return a `Result`, the `mapErr` function will return given `Result`
Err<TErr>.mapErr<TClass, TReturnResult>(classType: TClass, callback: (value: TErr) => TReturnResult): TReturnResult

// called on an `Ok` result, the `mapErr` function will return origin `Ok` (the `callback` won't be called)
Ok<TOk>.mapErr<unknown>(classType: unknown, callback: (value: never) => never): Ok<TOk>
```

**Examples:**

```typescript
import { Ok, Err } from 'type-safe-errors';
import { UserNotFoundError, Http404Error } from './errors';

const defaultUser = {
  name: 'John Doe',
}

const okOfDefaultUser = Err.of(new UserNotFoundError())
  .mapErr(UserNotFoundError, err => defaultUser);

const errOfHttp404 = Err.of(new UserNotFoundError())
  .mapErr(UserNotFoundError, err => Err.of(new Http404Error()));

const errOfUserNotFound = Err.of(new UserNotFoundError())
  .mapErr(Http404Error, err => 123);

const originOk = Ok.of(5);
const okOfNumber5 = originOk.mapErr(UserNotFoundError, err => null);
```

---

### result.mapAnyErr(callback)

Map any `Err` result to another result. 

**Signature:**

```typescript
// if `callback` return a value, the `mapAnyErr` function will return Ok.of(value)
Err<TErr>.mapAnyErr<TReturn>(callback: (value: TErr) => TReturn): Ok<TReturn>

// if `callback` return a `Result`, the `mapAnyErr` function will return given `Result`
Err<TErr>.mapAnyErr<TReturnResult>(callback: (value: TErr) => TReturnResult): TReturnResult

// called on an `Ok` result, the `mapAnyErr` function will return origin `Ok` (the `callback` won't be called)
Ok<TOk>.mapAnyErr<unknown>(callback: (value: never) => never): Ok<TOk>
```

**Examples:**

```typescript
import { Ok, Err } from 'type-safe-errors';
import { UserNotFoundError, Http404Error } from './errors';

const defaultUser = {
  name: 'John Doe',
}

const okOfDefaultUser = Err.of(new UserNotFoundError())
  .mapAnyErr(err => defaultUser);

const errOfHttp404 = Err.of(new UserNotFoundError())
  .mapAnyErr(err => Err.of(new Http404Error()));

const originOk = Ok.of(5);
const okOfNumber5 = originOk.mapAnyErr(err => 123);
```

---

### UnknownError
`UnknownError` is a special error class used to wrap unexpected errors that are thrown within the `map`, `mapErr`, `mapAnyErr`, or `Result.from` context. It has a `cause` property that contains the original error.

`UnknownError` is the only error that you're not required to handle before utilizing a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). This is because, even if you invoke [`result.mapErr(ErrorClass, callback)`](#resultmaperrerrorclass-callback) with `UnknownError` as the first parameter, your handler function might still throw an error. Thus, you can never be entirely confident that an unexpected error won't occur, and the library's API acknowledges this reality.

Examples:

```ts
import { Ok, UnknownError } from 'type-safe-errors';
import { UserNotFoundError } from './errors';

Ok.of(5)
  .map(val => {
    throw new Error('Problem!');
  })
  .mapErr(UnknownError, err => {
    // Logs the original Error('Problem!')
    console.error(err.cause);  
  });


Err.of(new UserNotFoundError())
  .mapErr(UserNotFoundError, err => {
    throw new Error('Problem!');
  })
  .mapErr(UnknownError, err => {
    // Logs the original Error('Problem!')
    console.error(err.cause);  
  });


Err.of(new UserNotFoundError())
  .mapErr(UserNotFoundError, err => {
    throw new Error('Problem!');
  })
  .mapAnyErr(err => {
    // Logs the original Error('Problem!')
    console.error(err.cause);  
  });
```


### result.unsafePromise()

Map any result to a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). 
`Ok` result will resolve the promise, `Err` will reject it.  

WARNING: the function is not recommended, as the operation will lost information about types of errors. Consider using of [ok.promise()](#okpromise) instead.

**Signature:**

```typescript
// called on an `Ok` result, the `unsafePromise` function will return promise that will resolve with `Ok` result value
Ok<TOk>.unsafePromise(): Promise<TOk>

// called on an `Err` result, the `unsafePromise` function will return promise that will reject with `Err` result value
Err<TErr>.unsafePromise(): Promise<never>

```

**Examples:**

```typescript
import { Ok, Err } from 'type-safe-errors';
import { UserNotFoundError } from './errors';

async function promiseResolver() {
  const number5 = await Ok.of(5).unsafePromise();

  // the line below will throw `UserNotFoundError` error,
  // as the promise will reject
  await Err.of(new UserNotFoundError()).unsafePromise();
}
```

---

