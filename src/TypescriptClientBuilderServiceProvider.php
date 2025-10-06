<?php
namespace Apie\TypescriptClientBuilder;

use Apie\ServiceProviderGenerator\UseGeneratedMethods;
use Illuminate\Support\ServiceProvider;

/**
 * This file is generated with apie/service-provider-generator from file: typescript_client_builder.yaml
 * @codeCoverageIgnore
 */
class TypescriptClientBuilderServiceProvider extends ServiceProvider
{
    use UseGeneratedMethods;

    public function register()
    {
        $this->app->singleton(
            \Apie\TypescriptClientBuilder\RouteDefinitions\CodeRouteDefinitionProvider::class,
            function ($app) {
                return new \Apie\TypescriptClientBuilder\RouteDefinitions\CodeRouteDefinitionProvider(
                
                );
            }
        );
        \Apie\ServiceProviderGenerator\TagMap::register(
            $this->app,
            \Apie\TypescriptClientBuilder\RouteDefinitions\CodeRouteDefinitionProvider::class,
            array(
              0 =>
              array(
                'name' => 'apie.common.route_definition',
              ),
            )
        );
        $this->app->tag([\Apie\TypescriptClientBuilder\RouteDefinitions\CodeRouteDefinitionProvider::class], 'apie.common.route_definition');
        $this->app->singleton(
            \Apie\TypescriptClientBuilder\CodeGenerators\EntityListFactory::class,
            function ($app) {
                return new \Apie\TypescriptClientBuilder\CodeGenerators\EntityListFactory(
                
                );
            }
        );
        $this->app->singleton(
            \Apie\TypescriptClientBuilder\CodeGenerators\Es6CodeGenerator::class,
            function ($app) {
                return new \Apie\TypescriptClientBuilder\CodeGenerators\Es6CodeGenerator(
                    $app->make(\Apie\TypescriptClientBuilder\CodeGenerators\EntityListFactory::class)
                );
            }
        );
        $this->app->singleton(
            \Apie\TypescriptClientBuilder\Controllers\Es6CodeController::class,
            function ($app) {
                return new \Apie\TypescriptClientBuilder\Controllers\Es6CodeController(
                    $app->make(\Apie\TypescriptClientBuilder\CodeGenerators\Es6CodeGenerator::class),
                    $app->make(\Apie\Core\BoundedContext\BoundedContextHashmap::class),
                    $this->parseArgument('%apie.rest_api.base_url%', \Apie\TypescriptClientBuilder\Controllers\Es6CodeController::class, 2)
                );
            }
        );
        \Apie\ServiceProviderGenerator\TagMap::register(
            $this->app,
            \Apie\TypescriptClientBuilder\Controllers\Es6CodeController::class,
            array(
              0 => 'controller.service_arguments',
            )
        );
        $this->app->tag([\Apie\TypescriptClientBuilder\Controllers\Es6CodeController::class], 'controller.service_arguments');
        
    }
}
