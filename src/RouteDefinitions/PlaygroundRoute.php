<?php
namespace Apie\TypescriptClientBuilder\RouteDefinitions;

use Apie\Common\Interfaces\HasRouteDefinition;
use Apie\Common\Lists\UrlPrefixList;
use Apie\Core\Enums\RequestMethod;
use Apie\Core\ValueObjects\UrlRouteDefinition;
use Apie\TypescriptClientBuilder\Controllers\PlaygroundController;

class PlaygroundRoute implements HasRouteDefinition
{
    public function getMethod(): RequestMethod
    {
        return RequestMethod::GET;
    }
    public function getUrl(): UrlRouteDefinition
    {
        return new UrlRouteDefinition('/js/contents/playground');
    }
    /**
     * @return class-string<object>
     */
    public function getController(): string
    {
        return PlaygroundController::class;
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
        return 'typescript_playground';
    }
    public function getUrlPrefixes(): UrlPrefixList
    {
        return new UrlPrefixList([]);
    }
}
