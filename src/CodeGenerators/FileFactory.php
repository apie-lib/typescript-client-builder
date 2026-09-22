<?php
namespace Apie\TypescriptClientBuilder\CodeGenerators;

use Apie\Core\BoundedContext\BoundedContextHashmap;
use Apie\TypescriptCodeBuilder\Dto\Expressions\JsonLiteralExpression;
use Apie\TypescriptCodeBuilder\Dto\Expressions\StringLiteralExpression;
use Apie\TypescriptCodeBuilder\Dto\File;
use Apie\TypescriptCodeBuilder\Dto\ImportStatement;
use Apie\TypescriptCodeBuilder\Dto\RawJavascript;
use Apie\TypescriptCodeBuilder\Dto\VariableAssignment;
use Apie\TypescriptCodeBuilder\Enums\VariableDeclarationKind;
use Apie\TypescriptCodeBuilder\Lists\CodeList;
use Apie\TypescriptCodeBuilder\Lists\JavascriptIdentifierList;
use Apie\TypescriptCodeBuilder\ValueObjects\JavascriptIdentifier;

class FileFactory
{
    public function __construct(
        private readonly EntityListFactory $entityListFactory,
    ) {
    }
    public function create(BoundedContextHashmap $boundedContextHashmap, string $apiEndpoint): File
    {
        return new File(
            new CodeList([
                new ImportStatement(
                    './contents/es6/index',
                    new JavascriptIdentifierList(['createForApi'])
                ),
                new VariableAssignment(
                    VariableDeclarationKind::Const,
                    new JavascriptIdentifier('apiUrl'),
                    new StringLiteralExpression($apiEndpoint)
                ),
                new VariableAssignment(
                    VariableDeclarationKind::Const,
                    new JavascriptIdentifier('resourceDefinition'),
                    new JsonLiteralExpression(
                        $this->entityListFactory->createTodolistPerBoundedContext($boundedContextHashmap),
                        prettified: true
                    )
                ),
                new RawJavascript('export const ApieLayer = createForApi(apiUrl, resourceDefinition);')
            ])
        );
    }
}
