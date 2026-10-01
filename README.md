<img src="https://raw.githubusercontent.com/apie-lib/apie-lib-monorepo/main/docs/apie-logo.svg" width="100px" align="left" />
<h1>typescript-client-builder</h1>






 [![Latest Stable Version](https://poser.pugx.org/apie/typescript-client-builder/v)](https://packagist.org/packages/apie/typescript-client-builder) [![Total Downloads](https://poser.pugx.org/apie/typescript-client-builder/downloads)](https://packagist.org/packages/apie/typescript-client-builder) [![Latest Unstable Version](https://poser.pugx.org/apie/typescript-client-builder/v/unstable)](https://packagist.org/packages/apie/typescript-client-builder) [![License](https://poser.pugx.org/apie/typescript-client-builder/license)](https://packagist.org/packages/apie/typescript-client-builder) [![PHP Composer](https://apie-lib.github.io/projectCoverage/coverage-typescript-client-builder.svg)](https://apie-lib.github.io/projectCoverage/typescript-client-builder/index.html)  

[![PHP Composer](https://github.com/apie-lib/typescript-client-builder/actions/workflows/php.yml/badge.svg?event=push)](https://github.com/apie-lib/typescript-client-builder/actions/workflows/php.yml)

This package is part of the [Apie](https://github.com/apie-lib) library.
The code is maintained in a monorepo, so PR's need to be sent to the [monorepo](https://github.com/apie-lib/apie-lib-monorepo/pulls)

## Documentation
Generates an ES module TypeScript client from an Apie API description, using
`apie/typescript-code-builder` as the underlying code-generation building blocks.

### Standalone usage
Install it with:
```bash
composer require apie/typescript-client-builder
```

`Apie\TypescriptClientBuilder\CodeGenerators\Es6CodeGenerator` (built from `EntityListFactory`
and `FileFactory`) turns a `BoundedContextHashmap` into TypeScript files. The builder is intended
to be called from a PHP application or build command; provide the API metadata and write the
generated module to your frontend source tree. The package does not require Laravel or Symfony;
the route/controller and service provider are optional integration glue.

### Symfony integration
Via `apie/apie-bundle`, `typescript_client_builder.yaml` registers
`Apie\TypescriptClientBuilder\Controllers\Es6CodeController` (using the `apie.rest_api.base_url`
parameter) as a controller service and
`Apie\TypescriptClientBuilder\RouteDefinitions\CodeRouteDefinitionProvider` as a route
definition, exposing an HTTP endpoint that serves the generated TypeScript client.

### Laravel integration
Via `apie/laravel-apie`, the generated
`Apie\TypescriptClientBuilder\TypescriptClientBuilderServiceProvider` registers the same
controller and route definition provider so the generated client is served the same way.
