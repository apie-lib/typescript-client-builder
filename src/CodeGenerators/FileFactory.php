<?php
namespace Apie\TypescriptClientBuilder\CodeGenerators;

use Apie\Core\BoundedContext\BoundedContext;
use Apie\Core\BoundedContext\BoundedContextHashmap;
use Apie\Core\Context\ApieContext;
use Apie\Core\Dto\ValueOption;
use Apie\Core\Enums\ScalarType;
use Apie\Core\Metadata\MetadataFactory;
use Apie\Core\Metadata\MetadataInterface;
use Apie\Core\ValueObjects\Exceptions\InvalidStringForValueObjectException;
use Apie\Core\ValueObjects\Utils;
use Apie\TypeConverter\ReflectionTypeFactory;
use Apie\TypescriptClientBuilder\Dto\TypeDeclarationResult;
use Apie\TypescriptCodeBuilder\Dto\Expressions\FunctionCallExpression;
use Apie\TypescriptCodeBuilder\Dto\Expressions\IdentifierExpression;
use Apie\TypescriptCodeBuilder\Dto\Expressions\JsonLiteralExpression;
use Apie\TypescriptCodeBuilder\Dto\Expressions\StringLiteralExpression;
use Apie\TypescriptCodeBuilder\Dto\File;
use Apie\TypescriptCodeBuilder\Dto\FunctionArgument;
use Apie\TypescriptCodeBuilder\Dto\ImportStatement;
use Apie\TypescriptCodeBuilder\Dto\RawJavascript;
use Apie\TypescriptCodeBuilder\Dto\Typehints\ArrayTypeDefinition;
use Apie\TypescriptCodeBuilder\Dto\Typehints\IdentifierTypeDefinition;
use Apie\TypescriptCodeBuilder\Dto\Typehints\InterfaceDefinition;
use Apie\TypescriptCodeBuilder\Dto\Typehints\LiteralTypeDefinition;
use Apie\TypescriptCodeBuilder\Dto\Typehints\ObjectTypeDefinition;
use Apie\TypescriptCodeBuilder\Dto\Typehints\RawTypeDefinition;
use Apie\TypescriptCodeBuilder\Dto\Typehints\UnionTypeDefinition;
use Apie\TypescriptCodeBuilder\Dto\TypescriptDeclaration;
use Apie\TypescriptCodeBuilder\Dto\VariableAssignment;
use Apie\TypescriptCodeBuilder\Enums\TypescriptType;
use Apie\TypescriptCodeBuilder\Enums\VariableDeclarationKind;
use Apie\TypescriptCodeBuilder\Lists\ArgumentList;
use Apie\TypescriptCodeBuilder\Lists\CodeList;
use Apie\TypescriptCodeBuilder\Lists\ExpressionList;
use Apie\TypescriptCodeBuilder\Lists\JavascriptIdentifierList;
use Apie\TypescriptCodeBuilder\Lists\TypescriptDeclarationList;
use Apie\TypescriptCodeBuilder\ValueObjects\JavascriptIdentifier;
use Apie\TypescriptCodeBuilder\ValueObjects\JavascriptIdentifierKey;
use ReflectionClass;
use ReflectionType;

class FileFactory
{
    public function __construct(
        private readonly EntityListFactory $entityListFactory,
        private readonly string $apieClassPrefix = 'ApieDefinition',
    ) {
    }

    /**
     * Creates a entity declaration
     */
    private function createEntityDeclaration(BoundedContext $boundedContext, ReflectionClass $entityClass): TypescriptDeclaration
    {
        $id = new JavascriptIdentifier(
            $this->apieClassPrefix . 'BoundedContext' . ucfirst($boundedContext->getId()->toNative()) . $entityClass->getShortName()
        );
        return new TypescriptDeclaration(
            $id,
            new UnionTypeDefinition(
                new TypescriptDeclarationList([
                    new IdentifierTypeDefinition($this->createDefinitionName($entityClass, '')),
                    new IdentifierTypeDefinition($this->createDefinitionName($entityClass, 'Modify')),
                    new IdentifierTypeDefinition($this->createDefinitionName($entityClass, 'Result'))
                ])
            )
        );
    }

    /**
     * Creates an interface for a bounded context.
     */
    private function createBoundedContextDeclaration(BoundedContext $boundedContext): InterfaceDefinition
    {
        $id = new JavascriptIdentifier($this->apieClassPrefix . 'BoundedContext' . ucfirst($boundedContext->getId()->toNative()));
        $performanceMethod = new RawTypeDefinition(
            '(entity: Entity) => Promise<Entity>',
            needsDefinition: ['Entity']
        );
        return new InterfaceDefinition(
            $id,
            new ArgumentList([
                new FunctionArgument(
                    new JavascriptIdentifierKey('entities'),
                    new ObjectTypeDefinition(
                        new ArgumentList(
                            array_map(
                                function (ReflectionClass $entityClass) use ($boundedContext) {
                                    $id = new JavascriptIdentifier(
                                        $this->apieClassPrefix
                                        . 'BoundedContext'
                                        . ucfirst($boundedContext->getId()->toNative())
                                        . $entityClass->getShortName()
                                    );
                                    return new FunctionArgument(
                                        new JavascriptIdentifierKey(Utils::getDisplayNameForValueObject($entityClass)),
                                        new IdentifierTypeDefinition($id)
                                    );
                                },
                                $boundedContext->resources->toArray()
                            )
                        )
                    )
                ),
                new FunctionArgument(
                    new JavascriptIdentifierKey('persist'),
                    $performanceMethod
                ),
                new FunctionArgument(
                    new JavascriptIdentifierKey('delete'),
                    $performanceMethod
                )
            ]),
            new JavascriptIdentifierList([
                'BoundedContext'
            ])
        );
    }

    /**
     * Creates an intterface for a bounded context hashmap.
     */
    private function createBoundedContextHashmapDeclaration(BoundedContextHashmap $hashmap): InterfaceDefinition
    {
        $list = [];
        foreach ($hashmap as $key => $boundedContext) {
            $list[] = new FunctionArgument(
                JavascriptIdentifierKey::createFromText($key),
                new IdentifierTypeDefinition(
                    new JavascriptIdentifier($this->apieClassPrefix . 'BoundedContext' . ucfirst($boundedContext->getId()->toNative()))
                )
            );
        }
        return new InterfaceDefinition(
            new JavascriptIdentifier($this->apieClassPrefix . 'BoundedContextHashmap'),
            new ArgumentList($list)
        );
    }

    private function createDefinitionName(
        ReflectionClass|ReflectionType $class,
        string $suffix
    ): JavascriptIdentifier {
        if ($class instanceof ReflectionClass) {
            return JavascriptIdentifier::createFromText(
                Utils::getDisplayNameForValueObject($class) . $suffix
            );
        }
        return JavascriptIdentifier::createFromText(
            ((string) $class) . $suffix
        );
    }

    private function buildTypeDeclaration(
        ReflectionClass|ReflectionType $class,
        MetadataInterface $metadata,
        string $suffix = ''
    ): TypeDeclarationResult {
        $definitionName = $this->createDefinitionName($class, $suffix);
        $valueOptions = $metadata->getValueOptions(new ApieContext());
        if (!empty($valueOptions?->toArray())) {
            return new TypeDeclarationResult(
                $definitionName,
                new UnionTypeDefinition(
                    new TypescriptDeclarationList(
                        array_map(
                            function (ValueOption $option) {
                                $value = $option->value;
                                return new LiteralTypeDefinition(is_object($value) ? Utils::toString($value) : $value);
                            },
                            $valueOptions->toArray()
                        )
                    )
                ),
                []
            );
        }
        $scalar = $metadata->toScalarType(true);
        $typedefinition = TypescriptType::Unknown;
        $todoList = [];
        switch ($scalar) {
            case ScalarType::ARRAY:
                $arrayItemMeta = $metadata->getArrayItemType();
                $arrayType = TypescriptType::Unknown;
                if ($arrayItemMeta) {
                    array_push(
                        $todoList,
                        [
                            $arrayItemMeta->toClass() ?? $arrayItemMeta->toScalarType()->toReflectionType(),
                            $arrayItemMeta,
                            $suffix === 'Result' ? 'Result' : ''
                        ],
                    );
                    $arrayType = new IdentifierTypeDefinition(
                        $this->createDefinitionName(
                            $arrayItemMeta->toClass() ?? $arrayItemMeta->toScalarType()->toReflectionType(),
                            $suffix === 'Result' ? 'Result' : ''
                        )
                    );
                }
                $typedefinition = new ArrayTypeDefinition($arrayType);
                break;
            case ScalarType::BOOLEAN:
                $typedefinition = TypescriptType::Boolean;
                break;
            case ScalarType::FLOAT:
            case ScalarType::INTEGER:
                $typedefinition = TypescriptType::Number;
                break;
            case ScalarType::NULLVALUE:
                $typedefinition = TypescriptType::NullValue;
                break;
            case ScalarType::MIXED:
            case ScalarType::STDCLASS:
                $args = [];
                $context = new ApieContext([]);
                foreach ($metadata->getHashmap() as $name => $field) {
                    if (!$field->isField()) {
                        continue;
                    }
                    $type = $field->getTypehint() ?? ReflectionTypeFactory::createReflectionType('mixed');
                    $meta = $suffix === 'Result'
                            ? MetadataFactory::getResultMetadata($type, $context)
                            : MetadataFactory::getCreationMetadata($type, $context);
                    $addSuffix = $suffix === 'Result' ? 'Result' : '';
                    $typeDeclaration = new IdentifierTypeDefinition(
                        $this->createDefinitionName($type, $addSuffix)
                    );
                    if ($type->allowsNull()) {
                        $typeDeclaration = new UnionTypeDefinition(
                            new TypescriptDeclarationList([
                                $typeDeclaration,
                                new LiteralTypeDefinition(null)
                            ])
                        );
                    }
                    $todoList[] = [
                        $type,
                        $meta,
                        $addSuffix
                    ];
                    try {
                        new JavascriptIdentifier($name);
                    } catch (InvalidStringForValueObjectException) {
                        continue;
                    }
                    $args[] = new FunctionArgument(
                        new JavascriptIdentifierKey($name),
                        $typeDeclaration,
                        optional: !$field->isRequired(),
                    );
                }
                $typedefinition = new ObjectTypeDefinition(new ArgumentList($args));
                break;
            case ScalarType::STRING:
                $typedefinition = TypescriptType::String;
        }
        return new TypeDeclarationResult(
            $definitionName,
            $typedefinition,
            $todoList
        );
    }

    private function buildTypeDeclarations(array $todoList, array& $completed): array
    {
        $result = [];
        while (!empty($todoList)) {
            $todoItem = array_shift($todoList);
            $declaration = $this->buildTypeDeclaration(...$todoItem);
            $key = $declaration->definitionName->toNative();
            if (!isset($completed[$key])) {
                array_push($todoList, ...$declaration->todoList);
                $result[] = new TypescriptDeclaration(
                    $declaration->definitionName,
                    $declaration->declaration
                );
                $completed[$key] = $declaration;
            }
        }
        return $result;
    }

    public function create(BoundedContextHashmap $boundedContextHashmap, string $apiEndpoint): File
    {
        $boundedContextDeclarations = [];
        $types = [];
        $context = new ApieContext([]);
        foreach ($boundedContextHashmap as $boundedContext) {
            foreach ($boundedContext->resources as $resource) {
                $boundedContextDeclarations[] = $this->createEntityDeclaration($boundedContext, $resource);
                $types[] = [$resource, MetadataFactory::getCreationMetadata($resource, $context)];
                $types[] = [$resource, MetadataFactory::getResultMetadata($resource, $context), 'Result'];
                $types[] = [$resource, MetadataFactory::getModificationMetadata($resource, $context), 'Modify'];
            }
            $boundedContextDeclarations[] = $this->createBoundedContextDeclaration($boundedContext);
        }
        $completed = [];
        $typeDeclarations = $this->buildTypeDeclarations($types, $completed);
        $hashmapDeclaration = $this->createBoundedContextHashmapDeclaration($boundedContextHashmap);

        $codeList = (new CodeList([
                new ImportStatement(
                    './contents/es6/index',
                    new JavascriptIdentifierList(['createForApi'])
                ),
                new ImportStatement(
                    './contents/es6/build-script',
                    new JavascriptIdentifierList(['BoundedContext', 'Entity']),
                    true
                ),
                ...$boundedContextDeclarations,
                ...$typeDeclarations,
                $hashmapDeclaration,
                new VariableAssignment(
                    VariableDeclarationKind::Const,
                    new JavascriptIdentifier('apiUrl'),
                    new StringLiteralExpression($apiEndpoint),
                    TypescriptType::String
                ),
                new VariableAssignment(
                    VariableDeclarationKind::Const,
                    new JavascriptIdentifier('resourceDefinition'),
                    new JsonLiteralExpression(
                        $this->entityListFactory->createTodolistPerBoundedContext($boundedContextHashmap),
                        prettified: true
                    )
                ),
                new VariableAssignment(
                    VariableDeclarationKind::Const,
                    new JavascriptIdentifier('ApieLayer'),
                    new FunctionCallExpression(
                        new IdentifierExpression(new JavascriptIdentifier('createForApi')),
                        new ExpressionList([
                            new IdentifierExpression(new JavascriptIdentifier('apiUrl')),
                            new IdentifierExpression(new JavascriptIdentifier('resourceDefinition')),
                        ])
                    ),
                    new IdentifierTypeDefinition($hashmapDeclaration->name)
                ),
                new RawJavascript('export { ApieLayer }', needsDefinition: ['ApieLayer'])
            ]))->sort();

        return new File(
            $codeList
        );
    }
}
