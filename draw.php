<?php

$x = intval($_REQUEST['x']);
$y = intval($_REQUEST['y']);

$css = file_get_contents('styling/main.css');
$header = file_get_contents('components/header.html');
$footer = file_get_contents('components/footer.html');

if (isset($_REQUEST['submit'])){
    $data = file_get_contents('php://input');
    
    $key = "$x,$y";
    $filename = "tmp/" . $key;
    file_put_contents($filename, $data);
    $result = shell_exec("python firestore.py $x $y 2>&1");
    if($result != 1 ){
        print_r($result);
        die();
    }
    return;
}

print <<<EOF
<!doctype html>
<html>
    <style>
        $css
    </style>
    <header> 
        $header
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/themes/classic.min.css"/> <!-- 'classic' theme -->
        <script src="pickr/dist/pickr.min.js"></script>
    </header>
    <body>
        <canvas id=draw_canvas name="$x,$y" width=600 height=600></canvas>
        <div id="painter_footer">
            <div id=picker ></div>
            <input type="button" value="Clear Canvas" onclick="clear_canvas()">
            <input type=submit value="Save" onclick="save($x, $y)">
        </div>
    </body>
    <footer>
        $footer
        <script src="draw.js"></script>
    </footer>
</html>
EOF;