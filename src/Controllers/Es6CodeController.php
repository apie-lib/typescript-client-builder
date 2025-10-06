<?php
namespace Apie\TypescriptClientBuilder\Controllers;

use Apie\Core\BoundedContext\BoundedContextHashmap;
use Apie\TypescriptClientBuilder\CodeGenerators\Es6CodeGenerator;
use Nyholm\Psr7\Response;
use Psr\Http\Message\ServerRequestInterface;

class Es6CodeController
{
    public function __construct(
        private readonly Es6CodeGenerator $codeGenerator,
        private readonly BoundedContextHashmap $boundedContextHashmap,
        private readonly string $apiPrefix
    ) {
    }

    public function __invoke(ServerRequestInterface $request): Response
    {
        $uri = $request->getUri();
        $scheme = $uri->getScheme();
        $host = $uri->getHost();
        $port = $uri->getPort();
        $baseUrl = $scheme . '://' . $host;
        if ($port !== null && !in_array($port, [80, 443])) {
            $baseUrl .= ':' . $port;
        }
        $apiPrefix = $baseUrl . $this->apiPrefix;
        return new Response(
            200,
            ['Content-Type' => 'application/javascript'],
            $this->codeGenerator->create(
                $this->boundedContextHashmap,
                $apiPrefix
            )
        );
    }
}
