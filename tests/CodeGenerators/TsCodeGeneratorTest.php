<?php
namespace Apie\Tests\TypescriptClientBuilder\CodeGenerators;

use Apie\Fixtures\BoundedContextFactory;
use Apie\TypescriptClientBuilder\CodeGenerators\EntityListFactory;
use Apie\TypescriptClientBuilder\CodeGenerators\FileFactory;
use Apie\TypescriptClientBuilder\CodeGenerators\TsCodeGenerator;
use PHPUnit\Framework\Attributes\Test;

class TsCodeGeneratorTest extends \PHPUnit\Framework\TestCase
{
    #[Test]
    public function it_can_generate_typescript_code()
    {
        $testItem = new TsCodeGenerator(new FileFactory(new EntityListFactory));
        $actual = $testItem->create(
            BoundedContextFactory::createHashmapWithMultipleContexts(),
            'https://apie-lib.blogspot.com/'
        );
        $fixturePath = __DIR__ . '/../../fixtures/code.ts';
        file_put_contents($fixturePath, $actual);
        $expected = file_get_contents($fixturePath);
        $this->assertEquals($expected, $actual);
    }
}
