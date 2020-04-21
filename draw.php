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
        <div class="flexcontainer">
            <div class="left"> 
                <div>
                    <canvas id=draw_canvas name="$x,$y" width=600 height=600></canvas>
                    <div id="painter_footer">
                        <div id=picker ></div>
                        <input type="button" value="Clear Canvas" onclick="clear_canvas()">
                        <input type=submit value="Save" onclick="save_canvas()">
                    </div>
                </div>
            </div>
            <div class="right">
                <div class="centered"> 
                    <input type="button" value="Start Drawing" onclick="start_countdown()">
                    <h2 id="timer"></h2>
                    <h2 id="pokemon_name"></h2>
                    <img id="pokemon_image"></img>
                    <div class="info_footer">
                        <p> Generations </p>
                        <label for="gen1"> 1 </label>
                        <input type="checkbox" name="gen1" id="gen1" value="1" checked>
                        <label for="gen2"> 2 </label>
                        <input type="checkbox" name="gen2" id="gen2" value="2" checked>
                        <label for="gen3"> 3 </label>
                        <input type="checkbox" name="gen3" id="gen3" value="3" checked>
                        <label for="gen4"> 4 </label>
                        <input type="checkbox" name="gen4" id="gen4" value="4" checked>
                        <label for="gen5"> 5 </label>
                        <input type="checkbox" name="gen5" id="gen5" value="5" checked>
                        <label for="gen6"> 6 </label>
                        <input type="checkbox" name="gen6" id="gen6" value="6" checked>
                        <label for="gen7"> 7 </label>
                        <input type="checkbox" name="gen7" id="gen7" value="7" checked>
                    </div>
                </div>
            </div>
        </div>
    </body>
    <footer>
        $footer
        <script src="draw.js"></script>
    </footer>
</html>
EOF;