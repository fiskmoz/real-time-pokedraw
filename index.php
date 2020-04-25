<?php

$css = file_get_contents('styling/main.css');
$header = file_get_contents('components/header.html');
$footer = file_get_contents('components/footer.html');
$modal = file_get_contents('components/modal.html');

print <<<EOF
<!doctype html>
<html>
    <style>
        $css
    </style>
    $modal
    <head>
        $header
    </head>
    <body>
        <div id="canvas_wrapper">
            <canvas id=preview_canvas></canvas>
        </div>
    </body>
    <footer>
        $footer
        <script src="index.js"></script>
    </footer>
</html>
EOF;