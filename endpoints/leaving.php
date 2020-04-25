<?php

$x = intval($_REQUEST['x']);
$y = intval($_REQUEST['y']);
$user = $_REQUEST['user'];    


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

$result = shell_exec("python ../scripts/user_leave.py $x  $y '$user' 2>&1 &");
    if($result != 1 ){
        print_r($result);
        die();
    }