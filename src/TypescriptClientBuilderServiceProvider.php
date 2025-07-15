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
        
    }
}
