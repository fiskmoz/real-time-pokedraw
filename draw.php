<?php

$x = $_REQUEST['x'];
$y = $_REQUEST['y'];

if (!isset($x) || !isset($y))
{
    header("Location: /page-not-found.php");
    return;
}
$y = intval($y);
$y = intval($y);

$css = file_get_contents('styling/main.css');
$header = file_get_contents('components/header.html');
$footer = file_get_contents('components/footer.html');
$modal = file_get_contents('components/modal.html');
$generation_selection = file_get_contents('components/draw/generation_selection.html');
$players_in_lobby = file_get_contents('components/draw/players_in_lobby.html');
$draw_canvas = file_get_contents('components/draw/draw_canvas.html');
$ad_sense = getenv('ad_sense');

print <<<EOF
<!doctype html>
<html>
    <style>
        $css
    </style>
    <head> 
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/themes/classic.min.css"/> <!-- 'classic' theme -->
        <script src="pickr/dist/pickr.min.js"></script>
        $header
    </head>
    <body>
        $modal
        <div class="drawing-wrapper">
            $draw_canvas
            $generation_selection
            $players_in_lobby
        </div>
        <div id="lobby_identifier" name="$x,$y"></div>
    </body>
    <footer>
        $footer
        <script src="draw.js"></script>
    </footer>
</html>
EOF;