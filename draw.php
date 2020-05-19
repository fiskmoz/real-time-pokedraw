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

$res = '
<!doctype html>
<html>

    <head> 
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/themes/classic.min.css"/> <!-- \'classic\' theme -->
        <script src="pickr/dist/pickr.min.js"></script>
        '.$header.'
        <style>
            '.$css.'
        </style>
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
        '.$modal.'
        <div class="drawing-wrapper">
            '.$draw_canvas.'
            '.$generation_selection.'
            '.$players_in_lobby.'
        </div>
        <div id="lobby_identifier" name="'.$x.','.$y.'"></div>
    </body>
    <footer>
        '.$footer.'
        <script src="draw.js"></script>
    </footer>
</html>';


print_r(trim(preg_replace('/\t+/', '', $res)));