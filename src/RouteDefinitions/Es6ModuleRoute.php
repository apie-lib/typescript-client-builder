<?php
namespace Apie\TypescriptClientBuilder\RouteDefinitions;

use Apie\Common\Interfaces\HasRouteDefinition;
use Apie\Common\Lists\UrlPrefixList;
use Apie\Core\Enums\RequestMethod;
use Apie\Core\ValueObjects\UrlRouteDefinition;
use Apie\TypescriptClientBuilder\Controllers\Es6CodeController;

class Es6ModuleRoute implements HasRouteDefinition
{
    public function getMethod(): RequestMethod
    {
        return RequestMethod::GET;
    }
    public function getUrl(): UrlRouteDefinition
    {
        return new UrlRouteDefinition('js/Apie.es6.js');
    }
    /**
     * @return class-string<object>
     */
    public function getController(): string
    {
        return Es6CodeController::class;
    }
    /**
     * @return array<string, mixed>
     */
    public function getRouteAttributes(): array
    {
        return [
        ];
    }
    public function getOperationId(): string
    {
        return 'es6_code';
    }
    public function getUrlPrefixes(): UrlPrefixList
    {
        return new UrlPrefixList([]);
    }
}
