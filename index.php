<?php

$css = file_get_contents('styling/main.css');
$header = file_get_contents('components/header.html');
$footer = file_get_contents('components/footer.html');
$modal = file_get_contents('components/modal.html');
$ad_sense = getenv('ad_sense');

$res ='
<!doctype html>
<html>
    <head>
        <style>
            '. $css .'
        </style>
        '. $header .'
    </head>
    <body>
        <div class="header">
            <a id="title" href="/">
                <img
                src="https://fontmeme.com/permalink/200422/a58eeebd41d1d7c606dc4e1881cc5acf.png"
                alt="pokemon-font"
                border="0"
                />
            </a>
        </div>
        '. $modal .'
        <div id="canvas_wrapper" class="preview-canvas-wrapper">
            <canvas id=preview_canvas class="preview-canvas" ></canvas>
        </div>
    </body>
    <footer>
        '. $footer .'
        <script src="index.js"></script>
    </footer>
</html>';

print_r(trim(preg_replace('/\t+/', '', $res)));
