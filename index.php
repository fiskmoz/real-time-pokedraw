<?php

print <<<EOF
<!doctype html>
<html>
<!-- The core Firebase JS SDK is always required and must be listed first -->
<script src="https://www.gstatic.com/firebasejs/7.14.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/7.14.1/firebase-firestore.js"></script>

<!-- TODO: Add SDKs for Firebase products that you want to use
     https://firebase.google.com/docs/web/setup#available-libraries -->

<script>

</script>

<style>
    body {
        background-color: aliceblue;
        margin : 16px;
        font-family: Arial, Helvetica, sans-serif;
    }
    
    #canvas_wrapper {
        position: relative;
    }

    #preview_canvas {
        border:1px #000000 solid; 
        cursor: pointer
    }

    #selectedBox {
        border : 1px #2b5e8a solid;
        background-color : #4da0e8;
        position: absolute;
        pointer-events: none;
    }

</style>
<body>

<div id="canvas_wrapper">
    <canvas id=preview_canvas></canvas>
</div>

<script src="index.js"></script>
</body>
</html>

EOF;