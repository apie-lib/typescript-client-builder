<?php
namespace Apie\TypescriptClientBuilder\Controllers;

use Nyholm\Psr7\Response;
use Nyholm\Psr7\Stream;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class StaticContentController
{
    public function __invoke(ServerRequestInterface $request): ResponseInterface
    {
        $filename = $request->getAttribute('filename');
        $localFilepath = $request->getAttribute('localFilepath');
        $filePath = $localFilepath . '/' . $filename;
        $handle = @fopen($filePath, 'rb');
        if ($handle === false) {
            return new Response(
                404,
                ['Content-Type' => 'text/plain'],
                "File not found: $filename"
            );
        }
        $stream = Stream::create($handle);
        $mimeType = mime_content_type($filePath);
        // issue in PHP 8.3
        if ($mimeType === 'text/x-java') {
            $mimeType = 'application/javascript';
        } elseif ($mimeType === false) {
            $mimeType = 'application/octet-stream';
        }
        return new Response(
            200,
            ['Content-Type' => $mimeType],
            $stream
        );
    }
}
