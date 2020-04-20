<?php

$x = intval($_REQUEST['x']);
$y = intval($_REQUEST['y']);

if (isset($_REQUEST['submit'])){
    $data = file_get_contents('php://input');
    
    $key = "$x,$y";
    $filename = "tmp/" . $key;
    file_put_contents($filename, $data);
    $result = shell_exec("python firestore.py $x $y");
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
</style>
<body>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/themes/classic.min.css"/> <!-- 'classic' theme -->
<script src="pickr/dist/pickr.min.js"></script>

<canvas id=draw_canvas width=600 height=600 style='margin:8px;border:1px #000000 solid'></canvas>
<div>
    <div id=picker ></div>
    <input typesubmit value = "Save" onclick="save($x, $y)">
</div>


<script src="draw.js"></script>
</body>
</html>

EOF;