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

File place and name: `/src/tests/<service_or_module_name>.test.ts`

### Test function naming

Test root function naming: `test_<service_or_module_name>`

Test step function naming:

- Success expected case: `<service_or_module_name>_true()`
- Fail/error expected cases: `<service_or_module_name>_err()`
