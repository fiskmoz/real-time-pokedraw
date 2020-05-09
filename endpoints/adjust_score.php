<?php

$x = intval($_REQUEST['x']);
$y = intval($_REQUEST['y']);
$user = $_REQUEST['user'];    
$score = intval($_REQUEST['score']);


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

if (!isset($score))
{
    echo "Score not set";
    return;
}

$result = shell_exec("python ../scripts/adjust_score.py $x  $y '$user' $score 2>&1 &");
    if($result != 1 ){
        print_r($result);
        die();
    }