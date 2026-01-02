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

## Coding conversions

As standard, follow [Coding conventions](../../CONTRIBUTING.md#coding-conventions). Then follow below.

### Files place & naming

File place and name: `/src/tests/tests_<service_or_module_name>.ts`

### Test function naming

Test set function naming: `tests_<service_or_module_name>`

Then call the test set function from `test_entry.test.ts`. This file has test HTTP server up and shutdown process.

Test step function naming:

- Success expected case: `<service_or_module_name>_true()`
- Fail/error expected cases: `<service_or_module_name>_err()`
