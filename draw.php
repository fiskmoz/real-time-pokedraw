<?php

$x = intval($_REQUEST['x']);
$y = intval($_REQUEST['y']);

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
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/themes/classic.min.css"/> <!-- 'classic' theme -->
        <script src="pickr/dist/pickr.min.js"></script>
        $ad_sense
        $header
    </head>
    <body>
        $modal
        <div class="drawing-wrapper">
            <div class="draw-canvas-wrapper"> 
                <div class="painter-header">
                    <div id=picker ></div>
                    <input type="button" class="button" value="Clear Canvas" onclick="clear_canvas()">
                    <input type="button" class="button" value="Stop Drawing" onclick="stop_drawing()">
                    <div class="drawing-status">
                        <div id="timer"></div>
                    </div>
                </div>
                <canvas id=draw_canvas class="draw-canvas watching" name="$x,$y" width=600 height=600></canvas>
            </div>
            <div class="generation-selection-wrapper">
                <div class="centered"> 
                    <div class="info-header">
                        Generations 
                        </br>
                        <label class="checkbox-container" for="gen1"> 1 
                            <input type="checkbox" name="gen1" id="gen1" value="1" checked>
                            <span class="checkmark"></span>
                        </label>
                        <label class="checkbox-container" for="gen2"> 2 
                            <input type="checkbox" name="gen2" id="gen2" value="2" checked>
                            <span class="checkmark"></span>
                        </label>
                        <label class="checkbox-container" for="gen3"> 3 
                            <input type="checkbox" name="gen3" id="gen3" value="3" checked>
                            <span class="checkmark"></span>
                        </label>
                        <label class="checkbox-container" for="gen4"> 4 
                            <input type="checkbox" name="gen4" id="gen4" value="4" checked>
                            <span class="checkmark"></span>
                        </label>
                        <label class="checkbox-container" for="gen5"> 5 
                            <input type="checkbox" name="gen5" id="gen5" value="5" checked>
                            <span class="checkmark"></span>
                        </label>
                        <label class="checkbox-container" for="gen6"> 6 
                            <input type="checkbox" name="gen6" id="gen6" value="6" checked>
                            <span class="checkmark"></span>
                        </label>
                        <label class="checkbox-container" for="gen7"> 7 
                            <input type="checkbox" name="gen7" id="gen7" value="7" checked>
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <div class="pokemon-info">
                        <input type="button" class="button" value="Start Drawing" onclick="start_countdown()">
                        <h2 id="pokemon_name"></h2>
                        <img id="pokemon_image"></img>
                    </div>
                </div>
            </div>
            <div class="players-in-lobby-wrapper">
                <div class="centered"> 
                    <div class="info-header drawing-status">
                        <b>Players in lobby:</b>
                    </div>
                    <div class="user-info">
                        <ul class="user-list" id="users_list"></ul>
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