# CLAUDE.md

This file provides guidance for AI assistants working with the **type-safe-errors** codebase.

## Documentation Location

**For comprehensive AI assistant documentation, see @AGENTS.md**

The AGENTS.md file contains:
- Complete codebase structure and architecture
- Development workflows and conventions
- Testing guidelines and best practices
- Common tasks and troubleshooting
- Build and release processes

## Quick Reference

### Project Type
TypeScript library providing type-safe error handling through a Result pattern

### Key Principles
1. **Minimal API**: One unified async Result type
2. **Type Safety First**: Preserve error types throughout async chains
3. **Zero Dependencies**: No runtime dependencies for minimal bundle size
4. **Prototype-Based**: Uses `Object.create` for memory efficiency

### Critical Requirements
- **Error Branding**: All custom error classes MUST include `private __brand!: never;`
- **ES6 Target**: tsconfig.json must use `"target": "es6"` or higher (ES5 breaks Error inheritance)
- **No importHelpers**: Keep `importHelpers: false` to avoid tslib dependency

### Common Commands
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run typecheck     # Type checking only
npm run lint          # ESLint
npm run build         # Build to dist/
```

### Test Framework
- **Framework**: Mocha with TDD UI
- **Assertions**: Chai (expect syntax)
- **Pattern**: `*.test.ts` files in `src/test/`
- **Timeout**: 10 seconds

### Before Making Changes
1. Read existing code first
2. Run tests before and after changes
3. Maintain type safety (avoid `any` in public API)
4. Consider bundle size impact
5. Update documentation for API changes
6. This is a published library - respect backward compatibility

---

**For complete details, always refer to @AGENTS.md**
