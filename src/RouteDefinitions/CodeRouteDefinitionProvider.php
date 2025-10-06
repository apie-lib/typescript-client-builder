<?php
namespace Apie\TypescriptClientBuilder\RouteDefinitions;

use Apie\Common\Interfaces\GlobalRouteDefinitionProviderInterface;
use Apie\Common\RouteDefinitions\ActionHashmap;
use Apie\Core\BoundedContext\BoundedContext;
use Apie\Core\Context\ApieContext;

class CodeRouteDefinitionProvider implements GlobalRouteDefinitionProviderInterface
{
    public function getGlobalRoutes(): ActionHashmap
    {
        $routes = [];
        $definition = new Es6ModuleRoute();
        $routes[$definition->getOperationId()] = $definition;
        $definition = new StaticContentRoute(
            __DIR__ . '/../../resources',
            '/js/contents/ts'
        );
        $routes[$definition->getOperationId()] = $definition;
        $definition = new StaticContentRoute(
            __DIR__ . '/../../dist/es6',
            '/js/contents/es6'
        );
        $routes[$definition->getOperationId()] = $definition;
        $definition = new StaticContentRoute(
            __DIR__ . '/../../dist/es5',
            '/js/contents/es5'
        );
        $routes[$definition->getOperationId()] = $definition;
        return new ActionHashmap($routes);
    }

    public function getActionsForBoundedContext(BoundedContext $boundedContext, ApieContext $apieContext): ActionHashmap
    {
        $routes = [];
        $definition = new StaticContentRoute(
            __DIR__ . '/../../resources',
            '/js/contents/ts'
        );
        $routes[$definition->getOperationId()] = $definition;
        $definition = new StaticContentRoute(
            __DIR__ . '/../../dist',
            '/js/contents/es6'
        );
        $routes[$definition->getOperationId()] = $definition;
        $definition = new StaticContentRoute(
            __DIR__ . '/../../dist/es5',
            '/js/contents/es5'
        );
        $routes[$definition->getOperationId()] = $definition;
        return new ActionHashmap($routes);
    }
}
