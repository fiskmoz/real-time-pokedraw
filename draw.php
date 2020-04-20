<?php

print <<<EOF
<!doctype html>
<html>
<style>
</style>
<body>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/themes/classic.min.css"/> <!-- 'classic' theme -->
<script src="pickr/dist/pickr.min.js"></script>

<canvas id=draw_canvas width=600 height=600 style='margin:8px;border:1px #000000 solid'></canvas>
<div id=picker ></div>

<script src="draw.js"></script>
</body>
</html>

EOF;