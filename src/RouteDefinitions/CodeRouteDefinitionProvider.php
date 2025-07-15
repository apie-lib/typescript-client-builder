<?php
namespace Apie\TypescriptClientBuilder\RouteDefinitions;

use Apie\Common\Interfaces\RouteDefinitionProviderInterface;
use Apie\Common\RouteDefinitions\ActionHashmap;
use Apie\Core\BoundedContext\BoundedContext;
use Apie\Core\Context\ApieContext;

class CodeRouteDefinitionProvider implements RouteDefinitionProviderInterface
{
    public function getActionsForBoundedContext(BoundedContext $boundedContext, ApieContext $apieContext): ActionHashmap
    {
        $routes = [];
        $definition = new StaticContentRoute(
            __DIR__ . '/../../resources',
            '/contents/ts'
        );
        $routes[$definition->getOperationId()] = $definition;
        $definition = new StaticContentRoute(
            __DIR__ . '/../../dist',
            '/contents/es6'
        );
        $routes[$definition->getOperationId()] = $definition;
        return new ActionHashmap($routes);
    }
}
