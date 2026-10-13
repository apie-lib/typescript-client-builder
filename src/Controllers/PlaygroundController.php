<?php
namespace Apie\TypescriptClientBuilder\Controllers;

use Nyholm\Psr7\Response;
use Psr\Http\Message\ResponseInterface;

/**
 * Serves a test page that runs the generated TypeScript client in the BrowserPlayground.
 */
class PlaygroundController
{
    public function __construct(private readonly string $jsBasePath = '/js/contents')
    {
    }

    public function __invoke(): ResponseInterface
    {
        $base = htmlspecialchars($this->jsBasePath, ENT_QUOTES);
        $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Apie Test Playground</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<script type="importmap">
{
  "imports": {
    "{$base}/es6/index": "{$base}/es6/index.js",
    "{$base}/es6/build-script": "{$base}/es6/build-script.js",
    "{$base}/es6/transport-layer": "{$base}/es6/transport-layer.js"
  }
}
</script>
<style>
body { font-family: system-ui, sans-serif; margin: 0; background: #f4f5f7; color: #1d2433; }
#playground { max-width: 1200px; margin: 0 auto; padding: 1rem; }
header { display: flex; justify-content: space-between; align-items: center; }
.layout { display: grid; grid-template-columns: 260px 1fr; gap: 1rem; }
.panel { background: #fff; border: 1px solid #d9dce3; border-radius: 6px; padding: 1rem; margin-bottom: 1rem; }
.panel-head { display: flex; justify-content: space-between; align-items: center; }
.tabs, .entity-list, .flags, .test-buttons { display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: .5rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: .75rem; }
.grid label { display: flex; flex-direction: column; font-size: .85rem; gap: .2rem; }
button { padding: .35rem .8rem; border: 1px solid #b8bdc9; border-radius: 4px; background: #fff; cursor: pointer; }
button.active, button.primary { background: #2b5fd9; border-color: #2b5fd9; color: #fff; }
input, select, textarea { padding: .3rem; border: 1px solid #b8bdc9; border-radius: 4px; }
.muted, .empty { color: #6b7385; }
.output, pre { background: #101624; color: #d7e0f5; padding: .75rem; border-radius: 4px; overflow: auto; white-space: pre-wrap; min-height: 3rem; }
</style>
</head>
<body>
<div id="playground"></div>
<script type="module">
import { apiUrl, resourceDefinition } from '{$base}/es6/Apie.js';
import { createBrowserPlayground } from '{$base}/es6/index.js';

window.playground = createBrowserPlayground(resourceDefinition, apiUrl).start('playground');
</script>
</body>
</html>
HTML;
        return new Response(200, ['Content-Type' => 'text/html; charset=utf-8'], $html);
    }
}
