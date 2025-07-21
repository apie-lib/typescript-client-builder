<?php
namespace Apie\Tests\TypescriptClientBuilder\CodeGenerators;

use Apie\Core\Context\ApieContext;
use Apie\Fixtures\Entities\UserWithAddress;
use Apie\TypescriptClientBuilder\CodeGenerators\EntityListFactory;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class EntityListFactoryTest extends TestCase
{
    #[Test]
    public function it_can_create_an_array_structure_from_an_entity()
    {
        $testItem = new EntityListFactory();
        $actual = $testItem->createTodoList(
            new \ReflectionClass(UserWithAddress::class),
            new ApieContext(['code-gen' => 1])
        );
        $expected = [
            ['type' => 'createEntity', 'name' => 'UserWithAddress'],
            [
                'type' => 'createProperty',
                'entityName' => 'UserWithAddress',
                'propertyName' => 'id',
                'writableOnCreation' => true,
                'writableOnModification' => false,
                'readable' => true,
            ],
            [
                'type' => 'createProperty',
                'entityName' => 'UserWithAddress',
                'propertyName' => 'password',
                'writableOnCreation' => true,
                'writableOnModification' => true,
                'readable' => false,
            ],
            [
                'type' => 'createProperty',
                'entityName' => 'UserWithAddress',
                'propertyName' => 'address',
                'writableOnCreation' => true,
                'writableOnModification' => false,
                'readable' => true,
            ],
        ];
        $this->assertEquals($expected, $actual);
    }
}
