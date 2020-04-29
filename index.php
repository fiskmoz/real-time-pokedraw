<?php

$css = file_get_contents('styling/main.css');
$header = file_get_contents('components/header.html');
$footer = file_get_contents('components/footer.html');
$modal = file_get_contents('components/modal.html');
$ad_sense = getenv('ad_sense');

print <<<EOF
<!doctype html>
<html>
    <style>
        $css
    </style>
    <head>
        $header
    </head>
    <body>
        $modal
        <div id="canvas_wrapper" class="preview-canvas-wrapper">
            <canvas id=preview_canvas class="preview-canvas" ></canvas>
        </div>
    </body>
    <footer>
        $footer
        <script src="index.js"></script>
    </footer>
</html>
EOF;