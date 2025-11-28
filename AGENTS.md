# AGENTS.md - AI Assistant Guide for type-safe-errors

## Project Overview

**type-safe-errors** is a TypeScript library that provides custom type-safe error handling through a Result-like pattern. It offers a promise-like async interface to maintain error type information throughout the application flow, solving the problem of TypeScript losing error types when promises are rejected.

**Key Features:**
- Type-safe error handling with preserved error types
- Promise-like async API (map, mapErr, mapAnyErr)
- Minimal API surface focused on practical usage
- Zero dependencies (intentionally avoids tslib to keep bundle size small)
- Support for both synchronous and asynchronous operations

**License:** MIT
**Author:** Wiktor Obrebski

## Codebase Structure

```
type-safe-errors/
├── src/
│   ├── index.ts                 # Main entry point, re-exports public API
│   ├── result.ts                # Result, Ok, Err factory implementations
│   ├── common-result.ts         # Core Result prototype and factory functions
│   ├── resultify.ts             # Helper to convert functions to return Results
│   ├── types/
│   │   ├── common-result.ts     # CommonResult interface and ResultWrapper type
│   │   ├── result.ts            # Result, Ok, Err namespace type definitions
│   │   └── result-helpers.ts    # Helper types for type inference and transformations
│   └── test/
│       ├── helper.ts            # Test utilities and branded error classes
│       ├── map.test.ts          # Tests for map, mapErr, mapAnyErr methods
│       ├── result-from.test.ts  # Tests for Result.from factory
│       ├── promise.test.ts      # Tests for promise conversion methods
│       ├── combine.test.ts      # Tests for Result.combine functionality
│       └── resultify.test.ts    # Tests for resultify helper
├── examples/                    # Framework-specific usage examples
│   ├── basic-example/
│   ├── express/
│   ├── fastify/
│   └── nestjs/
├── docs/
│   └── REFERENCE.md            # Complete API reference documentation
├── package.json
├── tsconfig.json
├── .eslintrc.js
└── .mocharc.json
```

## Core Architecture

### Design Philosophy

1. **Minimal API**: One unified async Result type (unlike some libraries with separate sync/async versions)
2. **Practical over Theoretical**: Promise-like API familiar to JavaScript developers, inspired by but not strictly adhering to functional programming's Either monad
3. **Type Safety**: Maintains error type information throughout the chain, enabling TypeScript to catch unhandled errors at compile time
4. **Zero Dependencies**: Avoids `importHelpers` and `tslib` to keep bundle size minimal

### Core Abstractions

#### 1. Result Pattern
The library implements three main types:
- **Ok<TValue>**: Represents successful operation result
- **Err<TError>**: Represents error result
- **Result<TValue, TError>**: Union type representing either Ok or Err

#### 2. Internal Architecture

**ResultWrapper**: Internal representation that wraps values with error state
```typescript
interface ResultWrapper<TErrorOrValue> {
  value: TErrorOrValue;
  isError: boolean;
}
```

**CommonResult**: Prototype-based implementation providing shared methods:
- `map(mapper)`: Transform Ok values
- `mapErr(ErrorClass, mapper)`: Handle specific error types
- `mapAnyErr(mapper)`: Handle any error type
- `promise()`: Convert to Promise (type-safe, only available when all errors handled)
- `unsafePromise()`: Convert to Promise (unsafe, loses type information)

**Implementation Strategy:**
- Uses prototype-based object creation (`Object.create`) for memory efficiency
- All Results are promise-based internally (stored in `__value` property)
- Async by default to provide consistent API

#### 3. Key Patterns

**Type Branding**: Error classes MUST include a brand to differentiate structurally similar types:
```typescript
class MyError extends Error {
  private __brand!: never;  // Required for type discrimination
}
```

**Factory Pattern**: Ok, Err, and Result are namespaces with factory methods:
- `Ok.of(value)`: Create Ok result
- `Err.of(error)`: Create Err result
- `Result.from(factory)`: Wrap function execution
- `Result.combine([results])`: Combine multiple results

**UnknownError**: Special error class wrapping unexpected thrown exceptions with `cause` property

## Development Workflow

### Setup
```bash
npm install
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

**Test Framework:** Mocha with TDD UI
**Assertions:** Chai
**Test Runner:** ts-node/register for TypeScript execution
**Timeout:** 10 seconds (configured in .mocharc.json)

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

**Linter:** ESLint with TypeScript parser
**Style:** Prettier integration
**Key Rules:**
- No non-null assertions (`@typescript-eslint/no-non-null-assertion`: error)
- Unused vars with `_` prefix allowed
- No explicit return types required (type inference preferred)

### Building
```bash
npm run build
```

**Compiler:** TypeScript
**Target:** ES6 (minimum required for proper Error extending)
**Output:** `dist/` directory with .js, .d.ts, and .map files
**Module:** CommonJS

### Publishing
```bash
npm run prepublishOnly  # Runs tests + build automatically
npm publish
```

**Published Files:** Only `dist/**/*` (see package.json "files" field)

## Code Conventions

### TypeScript Configuration

**Target:** ES6 minimum (ES5 breaks Error inheritance - see Troubleshooting in README)
**Strict Mode:** Enabled
**No Import Helpers:** `importHelpers: false` to avoid tslib dependency
**Module Resolution:** Node
**Source Maps:** Enabled

### File Organization

1. **Type Definitions**: Separated into `types/` directory
   - Allows importing types without circular dependencies
   - Clean separation between runtime and compile-time code

2. **Index Pattern**: Re-exports with aliasing
   ```typescript
   // Import type and value separately, export on same name
   import type { Result as ResultType } from './types/result-helpers';
   import { Result as ResultVal } from './result';
   export const Result = ResultVal;
   export type Result<TValue, TError> = ResultType<TValue, TError>;
   ```

3. **Test Helpers**: Centralized in `src/test/helper.ts`
   - Branded error classes for testing
   - Shared utilities to reduce duplication

### Naming Conventions

- **Classes**: PascalCase (e.g., `UnknownError`, `CommonResult`)
- **Functions**: camelCase (e.g., `commonResultFactory`, `wrapResultFactory`)
- **Types/Interfaces**: PascalCase (e.g., `ResultWrapper`, `Constructor`)
- **Constants**: camelCase for factories, SCREAMING_SNAKE_CASE for true constants
- **Private fields**: Prefix with double underscore for internal fields (e.g., `__value`, `__brand`)

### Error Handling Patterns

**Always brand custom errors:**
```typescript
class InvalidCredentialsError extends Error {
  private __brand!: never;  // REQUIRED
}
```

**Prefer specific error handling:**
```typescript
// Good: Handle specific errors
result
  .mapErr(UserNotFoundError, err => handleUserNotFound(err))
  .mapErr(InvalidCredentialsError, err => handleInvalidCreds(err))
  .promise();

// Avoid: Catching all errors loses type information
result.mapAnyErr(err => handleAnyError(err)).promise();
```

**Handle UnknownError for unexpected exceptions:**
```typescript
Result.from(() => mightThrow())
  .map(value => process(value))
  .mapErr(ExpectedError, err => handle(err))
  .mapErr(UnknownError, err => {
    console.error(err.cause);  // Original thrown value
  });
```

## Testing Conventions

### Test Structure

Tests use Mocha's TDD interface:
```typescript
suite('Feature Name', () => {
  test('should do specific thing', async () => {
    // Arrange
    const input = createInput();

    // Act
    const result = await performAction(input);

    // Assert
    expect(result).to.deep.equal(expected);
  });
});
```

### Test File Naming
- Pattern: `*.test.ts`
- Located in: `src/test/`
- Mirrors feature being tested (e.g., `map.test.ts` tests map-related functionality)

### Assertion Library
Use Chai's expect syntax:
```typescript
import { expect } from 'chai';

expect(value).to.equal(expected);
expect(array).to.deep.equal(expectedArray);
expect(fn).to.throw(ErrorClass);
```

### Testing Async Results
Results are promise-like, so use async/await in tests:
```typescript
test('should map value', async () => {
  const result = Ok.of(5).map(x => x * 2);
  const value = await result.promise();
  expect(value).to.equal(10);
});
```

## Key Implementation Details

### Why Prototype-Based?
The library uses `Object.create(CommonResultPrototype)` instead of classes for:
- Memory efficiency (shared methods, not per-instance)
- Smaller bundle size
- Simpler type system (no class inheritance complexity)

### Why Always Async?
All Results are promise-based internally because:
- Simplifies API (no separate sync/async Result types)
- Real-world usage is predominantly async
- Avoids type system complexity
- Promise overhead is negligible for most use cases

### Type Inference Strategy
Heavy use of TypeScript's conditional types and inference:
- `InferOk<Result>`: Extract Ok type from Result
- `InferErr<Result>`: Extract Err type from Result
- `MapOkResult`, `MapErrResult`: Compute result types of transformations

The type system enforces that `.promise()` is only callable when all known errors are handled.

## Common Tasks for AI Assistants

### Adding New Methods to Result

1. **Add to CommonResultPrototype** in `src/common-result.ts`:
   ```typescript
   const CommonResultPrototype: CommonResult<unknown> = {
     // ... existing methods
     newMethod(arg) {
       const newValWrapperPromise = this.__value.then((wrapper) => {
         // Your logic here
       });
       return commonResultFactory(newValWrapperPromise) as any;
     },
   };
   ```

2. **Add type definition** in `src/types/common-result.ts`:
   ```typescript
   interface CommonResult<TErrorOrValue> {
     // ... existing methods
     newMethod<U extends Result<unknown, unknown>>(
       this: U,
       arg: ArgType
     ): ReturnType;
   }
   ```

3. **Add tests** in `src/test/` (create new file or add to existing)

4. **Update documentation** in `docs/REFERENCE.md`

### Adding Helper Functions

1. Create implementation in new file or existing file in `src/`
2. Add type definitions if complex types needed in `src/types/`
3. Export from `src/index.ts`
4. Add comprehensive tests
5. Update README and REFERENCE.md

### Fixing Type Inference Issues

- Check `src/types/result-helpers.ts` for helper types
- Ensure branded errors have `private __brand!: never`
- Verify ES6+ target in tsconfig.json (ES5 breaks instanceof)
- Use `as any` sparingly in implementations (internal only, not in public types)

### Investigating Test Failures

1. Run specific test file: `NODE_ENV=test mocha --ui tdd src/test/specific.test.ts`
2. Check if error classes are properly branded
3. Verify async operations use await
4. Ensure test timeout is sufficient (10s default)

### Modifying Build Output

- Edit `tsconfig.json` for compiler options
- Remember: `importHelpers: false` is intentional for bundle size
- Output always goes to `dist/`
- Only `dist/**/*` is published (package.json "files")

## Important Files Reference

### Source Files
- **src/index.ts**: Public API surface - check here for what's exported
- **src/common-result.ts**: Core implementation - modify for behavior changes
- **src/types/result-helpers.ts**: Type magic - most complex TypeScript

### Configuration Files
- **tsconfig.json**: TypeScript compiler config (ES6 target critical)
- **.eslintrc.js**: Code style rules
- **.mocharc.json**: Test runner configuration
- **package.json**: Scripts, dependencies, publish config

### Documentation
- **README.md**: User-facing documentation, philosophy, basic examples
- **docs/REFERENCE.md**: Complete API reference
- **examples/**: Framework integration examples

## Dependencies

**Runtime:** NONE (intentional)

**DevDependencies:**
- TypeScript
- Mocha (test runner)
- Chai (assertions)
- ESLint + TypeScript plugin
- Prettier
- ts-node (for running tests)
- @types packages for Node, Mocha, Chai

## Build Artifacts

**Generated:** `dist/` directory
- `dist/index.js`: Main entry point (CommonJS)
- `dist/index.d.ts`: Type definitions
- `dist/*.js.map`: Source maps
- Additional files for each source module

**Not Committed:** dist/, node_modules/ (.gitignore)

## Repository Information

- **GitHub:** https://github.com/wiktor-obrebski/type-safe-errors
- **NPM:** type-safe-errors
- **Issues:** https://github.com/wiktor-obrebski/type-safe-errors/issues

## AI Assistant Best Practices

1. **Read Before Modifying**: Always read existing files before suggesting changes
2. **Test First**: Run tests before and after changes
3. **Type Safety**: Preserve type safety - avoid `any` in public API
4. **Bundle Size**: Consider impact on bundle size (avoid new dependencies)
5. **Documentation**: Update README.md and docs/REFERENCE.md for API changes
6. **Backward Compatibility**: This is a published library - breaking changes require major version bump
7. **Examples**: Update examples/ if adding features users might want to see demonstrated
8. **Error Branding**: Remind users to brand custom error classes with `private __brand!: never`

## Troubleshooting

### Tests Failing with instanceof Issues
- Ensure tsconfig.json has `"target": "es6"` or higher
- Verify error classes extend Error properly
- Check that error classes have brand property

### Type Inference Not Working
- Check that errors are branded
- Verify Result.from() is used for starting async chains
- Ensure all error handlers come before .promise()

### Build Failures
- Run `npm run typecheck` to isolate type errors
- Check that new code doesn't require ES features beyond ES6
- Verify no syntax requiring importHelpers was introduced

### Publish Issues
- `prepublishOnly` runs tests + build automatically
- Only dist/ is published (check package.json "files")
- Ensure version is bumped in package.json

---

**Last Updated:** 2025-11-28
