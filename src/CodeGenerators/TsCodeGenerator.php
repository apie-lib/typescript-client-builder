<?php
namespace Apie\TypescriptClientBuilder\CodeGenerators;

use Apie\Core\BoundedContext\BoundedContextHashmap;

class TsCodeGenerator
{
    public function __construct(
        private readonly FileFactory $fileFactory,
    ) {
    }

    public function create(BoundedContextHashmap $boundedContextHashmap, string $apiEndpoint): string
    {
        return $this->fileFactory->create($boundedContextHashmap, $apiEndpoint)->toTypescript();
    }
}
