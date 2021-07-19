# Type-safe errors in TypeScript

## Description

`type-safe-errors` is a library that provide type-safe domain errors to Typescript.  

Basic example

```ts
import { Ok, Err } from '../index';

class InvalidCredentials extends Error {
  __brand!: 'InvalidCredentials';
}

authorizeUser('admin', 'admin')
  .map((user) => {
    // user is full typed object {name: string, isAdmin: boolean}
    console.log('authorized! hello ', user.name);
  })
  .mapErr(InvalidCredentials, (err) => {
    // err is fully typed err object (InvalidCredentials class instance)
    console.log('Invalid credentials!', err);
  });

function authorizeUser(username: string, password: string) {
  if (username !== 'admin' || password !== 'admin') {
    return Err.of(new InvalidCredentials());
  }

  return Ok.of({
    name: 'admin',
    isAdmin: true,
  });
}
```

## Table Of Contents

* [Installation](#installation)
* [Philosphy](#philosphy)
* [API Documentation](#api-documentation)
* [Inspiration](#inspiration)

## Installation

```sh
npm i type-safe-errors
```

```ts
import { Ok } from 'type-safe-errors';

const okValue = Ok.of(5);
okValue
    .map(val => 2 * val)
    .map((val) => console.log(val));
```

## Philosphy
[Describe the project philosphy: minimal API, practical API, async]

## API Documentation

`type-safe-errors` expose three objects: `Ok`, `Err` and `Result`.

### Ok
`Ok` object represents a valid result of an action.

#### `Ok.of`

Create new `Ok` result.

**Signature:**

```typescript
Ok.of<TValue>(value: TValue): Ok<TValue> {}
```

**Example:**

```typescript
import { Ok } from 'type-safe-errors';

const okResult = Ok.of({
  name: "John",
  surname: "Doe"
});
```

---

### Err
`Err` object represents an invalid result of an action.

#### `Err.of`

Create new `Err` result.

**Signature:**

```typescript
Err.of<TError>(value: TError): Err<TError> {}
```

**Example:**

```typescript
import { Err } from 'type-safe-errors';

class UserNotFound {
  __brand: "UserNotFound"
}

const errResult = Err.of(new UserNotFound());
```

---

## Inspiration
[Reference `Khalil` ("https://khalilstemmler.com/"), `neverthrow` and others]
