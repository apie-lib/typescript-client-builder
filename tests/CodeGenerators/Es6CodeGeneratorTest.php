<?php
namespace Apie\Tests\TypescriptClientBuilder\CodeGenerators;

use Apie\Fixtures\BoundedContextFactory;
use Apie\TypescriptClientBuilder\CodeGenerators\EntityListFactory;
use Apie\TypescriptClientBuilder\CodeGenerators\Es6CodeGenerator;
use PHPUnit\Framework\Attributes\Test;

class Es6CodeGeneratorTest extends \PHPUnit\Framework\TestCase
{
    #[Test]
    public function it_can_generate_es6_code()
    {
        $testItem = new Es6CodeGenerator(new EntityListFactory);
        $actual = $testItem->create(
            BoundedContextFactory::createHashmapWithMultipleContexts(),
            'https://apie-lib.blogspot.com/'
        );
        $fixturePath = __DIR__ . '/../../fixtures/es6.module.js';
        // file_put_contents($fixturePath, $actual);
        $expected = file_get_contents($fixturePath);
        $this->assertEquals($expected, $actual);
    }
}