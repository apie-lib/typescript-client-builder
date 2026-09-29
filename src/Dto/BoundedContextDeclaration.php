<?php
namespace Apie\TypescriptClientBuilder\Dto;

use Apie\Core\BoundedContext\BoundedContext;
use Apie\TypescriptCodeBuilder\Dto\Typehints\InterfaceDefinition;
use Apie\TypescriptCodeBuilder\Lists\ArgumentList;
use Apie\TypescriptCodeBuilder\Lists\JavascriptIdentifierList;
use Apie\TypescriptCodeBuilder\TypescriptTypeDeclarationInterface;
use Apie\TypescriptCodeBuilder\ValueObjects\JavascriptIdentifier;

class BoundedContextDeclaration implements TypescriptTypeDeclarationInterface
{
    private InterfaceDefinition $internal;

    public function __construct(
        BoundedContext $hashmap,
        string $apieClassPrefix
    ) {
        $this->internal = (new InterfaceDefinition(
            new JavascriptIdentifier($apieClassPrefix . 'BoundedContext' . $hashmap->getId()),
            new ArgumentList()
        ));
    }

    public function toTypescript(): string
    {
        return $this->internal->toTypescript();
    }
    public function toJavascript(): string
    {
        return '';
    }
    public function providesDefinitions(bool $applyBlockScope): JavascriptIdentifierList
    {
        return $this->internal->providesDefinitions($applyBlockScope);
    }
    public function needsDefinitions(): JavascriptIdentifierList
    {
        return $this->internal->needsDefinitions();
    }
}
