<?php
namespace Apie\TypescriptClientBuilder\CodeGenerators;

use Apie\Core\BoundedContext\BoundedContextHashmap;
use Apie\Core\Context\ApieContext;
use Apie\Core\ContextConstants;
use Apie\Core\Metadata\MetadataFactory;

final class EntityListFactory
{
    /**
     * @param ReflectionClass<EntityInterface> $entityClass
     * @return array<int, array<string, mixed>>
     */
    public function createTodoList(\ReflectionClass $entityClass, ApieContext $context): array
    {
        $todoList = [];
        $todoList[] = ['type' => 'createEntity', 'name' => $entityClass->getShortName()];
        $properties = [];
        $creationMetadata = MetadataFactory::getCreationMetadata($entityClass, $context);
        $modificationMetadata = MetadataFactory::getModificationMetadata($entityClass, $context);
        $resultMetadata = MetadataFactory::getResultMetadata($entityClass, $context);
        $foundProperties = array_keys(array_merge(
            $creationMetadata->getHashmap()->toArray(),
            $modificationMetadata->getHashmap()->toArray(),
            $resultMetadata->getHashmap()->toArray()
        ));
        foreach ($foundProperties as $propertyName) {
            $properties[$propertyName] = [
                'type' => 'createProperty',
                'entityName' => $entityClass->getShortName(),
                'propertyName' => $propertyName,
                'writableOnCreation' => false,
                'writableOnModification' => false,
                'readable' => false,
            ];
        }
        foreach ($creationMetadata->getHashmap() as $propertyName => $metadata) {
            $properties[$propertyName]['writableOnCreation'] = true;
        }
        foreach ($modificationMetadata->getHashmap() as $propertyName => $metadata) {
            $properties[$propertyName]['writableOnModification'] = true;
        }
        foreach ($resultMetadata->getHashmap() as $propertyName => $metadata) {
            $properties[$propertyName]['readable'] = true;
        }
        $todoList = [...$todoList, ...array_values($properties)];
        return $todoList;
    }

    /**
     * @return array<string, array<int, array<string, mixed>>>
     */
    public function createTodolistPerBoundedContext(BoundedContextHashmap $boundedContextHashmap): array
    {
        $result = [];
        // TODO use ApieContext builder?
        $context = new ApieContext(['code-gen' => 1]);
        foreach ($boundedContextHashmap as $boundedContext) {
            $todoList = [];
            foreach ($boundedContext->resources as $entityClass) {
                $todoList = [
                    ...$todoList,
                    ...$this->createTodoList(
                        $entityClass,
                        $context->withContext(ContextConstants::BOUNDED_CONTEXT_ID, $boundedContext->getId()->toNative())
                            ->registerInstance($boundedContext)
                            ->registerInstance($boundedContext->getId())
                    )
                ];
            }
            $result[$boundedContext->getId()->toNative()] = $todoList;
        }
        return $result;
    }
}
