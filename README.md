# use-x

Practice implementing custom react hooks with full test suites and examples.

## Hooks

- [useFetch](./src/use-fetch)
  - Manage the error, loading and data state of `fetch`

## Setup

Install dependencies

```sh
pnpm i
```

## Enable tests

All tests are skipped by default. To enable a test, remove `.skip`

```diff
- it.skip("should test the hook", async () => {
+ it("should test the hook", async () => {
  // codes here
});
```

Run all tests

```sh
pnpm test
```

Run a specific test suite

```sh
pnpm test ./src/path/to/test/file/use-hook.test.ts
```
