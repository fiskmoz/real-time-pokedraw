<?php

$x = intval($_REQUEST['x']);
$y = intval($_REQUEST['y']);
$user = $_REQUEST['user'];    
$is_drawing = $_REQUEST['isDrawing'];


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

if (!isset($user))
{
    echo "Y not set";
    return;
}

if (!isset($is_drawing))
{
    echo "is_drawing not set";
    return;
}

$result = shell_exec("python ../scripts/adjust_drawing_status.py $x  $y '$user' $is_drawing 2>&1 &");
    if($result != 1 ){
        print_r($result);
        die();
    }