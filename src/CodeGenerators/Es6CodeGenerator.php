<?php
namespace Apie\TypescriptClientBuilder\CodeGenerators;

use Apie\Core\BoundedContext\BoundedContextHashmap;

class Es6CodeGenerator
{
    public function __construct(
        private readonly EntityListFactory $entityListFactory,
    ) {
    }

    public function create(BoundedContextHashmap $boundedContextHashmap, string $apiEndpoint): string
    {
        return "import { createForApi } from './contents/es6/index';
const apiUrl = " . json_encode($apiEndpoint, JSON_UNESCAPED_SLASHES) . ";
const resourceDefinition = " . json_encode($this->entityListFactory->createTodolistPerBoundedContext($boundedContextHashmap), JSON_PRETTY_PRINT) . ";
export const ApieLayer = createForApi(apiUrl, resourceDefinition);
";

    }
}
