# Type-safe errors in TypeScript

## Overview

`type-safe-errors` provides type-safe domain errors to Typescript.  

## Table Of Contents

* [Installation](#installation)
* [Philosphy](#philosphy)
* [API Reference](./docs/REFERENCE.md)
* [Inspiration](#inspiration)

## Installation

```sh
npm i type-safe-errors
```

```ts

### Basic example

```ts
import { Ok, Err } from 'type-safe-errors';

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

## Description
If you work with rich business logic it's common to use exceptions in js to represent different states of the application. The problem with this solution and TypeScript is that when you catching an exception, you lost information about it's types. 

Let consider this simplified example from an [express](https://expressjs.com/) controller:

```ts
try {
  await payForProduct(userCard, product);
} catch (err) {
  res.send(500, "Internal server error");
}
```

By looking at this code, you can not determine what kind of exception can happen.
Of course, you can check `payForProduct` body, but what if it's called other functions? And they call more? For rich business logic, it's unmaintainable to follow all
possible custom exception just by reading the code.  

Because of this, it's common to just return `500` in such cases (`express` doing it by default). But there can be many errors that should be handled differently than `500` status code. For example, maybe the user does not set any address data yet? Maybe his cart expired? Or did he provide an invalid CVC number?  

The client app should be informed of the reason, for example, by `400` status code and error details in the response body. But first, to properly handle the errors, the developer must be aware of what errors can happen.  
This is the problem that `type-safe-errors` library is trying to solve.  
[*PASTE GIF WITH "Basic example" showing the functions and type hints*]  

(Full example: [./examples/basic-example](./examples/basic-example))

## Philosphy
[Describe the project philosphy: minimal API, practical API, async]

## Inspiration
[Reference `Khalil` ("https://khalilstemmler.com/"), `neverthrow` and others]
