<?php
namespace Apie\TypescriptClientBuilder\Dto;

use Apie\Core\Dto\DtoInterface;
use Apie\TypescriptCodeBuilder\TypescriptTypeDeclarationInterface;
use Apie\TypescriptCodeBuilder\ValueObjects\JavascriptIdentifier;

class TypeDeclarationResult implements DtoInterface
{
    public function __construct(
        public JavascriptIdentifier $definitionName,
        public TypescriptTypeDeclarationInterface $declaration,
        public array $todoList
    ) {
    }
}
