<?php

$css = file_get_contents('styling/main.css');
$header = file_get_contents('components/header.html');
$footer = file_get_contents('components/footer.html');

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
        <div class="centered">
            <h1> Page not found </h1>
        </div>
    </body>
    <footer>
        $footer
        <script src="index.js"></script>
    </footer>
</html>
EOF;