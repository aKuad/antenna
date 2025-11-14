# Tests usage and coding conventions

## Usage

### JavaScript automated tests

```sh
# Set current directory
cd denotest

# Run tests
deno test --allow-net --allow-read

# For report coverage
deno test --allow-net --allow-read --coverage
```

> [!WARN]
>
> Do not add `--parallel` option.

## Coding conversions

As standard, follow [Coding conventions](../../CONTRIBUTING.md#coding-conventions). Then follow below.

### Files place & naming

`/src/tests/<service_name>.test.ts`

### Test function naming

Root test function naming:

`<service_name>()`

Test step function naming:

- Success expected case: `true_cases()`
- Fail/error expected cases: `err_cases()`
