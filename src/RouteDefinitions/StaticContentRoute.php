<?php
namespace Apie\TypescriptClientBuilder\RouteDefinitions;

use Apie\Common\Interfaces\HasRouteDefinition;
use Apie\Common\Lists\UrlPrefixList;
use Apie\Core\Enums\RequestMethod;
use Apie\Core\ValueObjects\UrlRouteDefinition;
use Apie\TypescriptClientBuilder\Controllers\StaticContentController;

class StaticContentRoute implements HasRouteDefinition
{
    public function __construct(
        private string $localFilepath,
        private string $urlPath
    ) {
    }

    public function getMethod(): RequestMethod
    {
        return RequestMethod::GET;
    }
    public function getUrl(): UrlRouteDefinition
    {
        return new UrlRouteDefinition($this->urlPath . '/{filename}');
    }
    /**
     * @return class-string<object>
     */
    public function getController(): string
    {
        return StaticContentController::class;
    }
    /**
     * @return array<string, mixed>
     */
    public function getRouteAttributes(): array
    {
        return [
            'localFilepath' => $this->localFilepath,
        ];
    }
    public function getOperationId(): string
    {
        return 'static_content_' . str_replace('/', '_', $this->urlPath);
    }
    public function getUrlPrefixes(): UrlPrefixList
    {
        return new UrlPrefixList([]);
    }
}
