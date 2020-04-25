<?php

$x = intval($_REQUEST['x']);
$y = intval($_REQUEST['y']);


if (!isset($x))
{
    echo "User not set";
    return;
}

if (!isset($y))
{
    echo "X not set";
    return;
}

$data = file_get_contents('php://input');
    
$key = "$x,$y";
$filename = "../tmp/" . $key;
file_put_contents($filename, $data);
$result = shell_exec("python ../scripts/draw_save.py $x $y 2>&1");
if($result != 1 ){
    print_r($result);
    die();
}
return;