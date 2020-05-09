<?php

$x = intval($_REQUEST['x']);
$y = intval($_REQUEST['y']);
$user = str_replace(' ','_',$_REQUEST['user']);    


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
header('Content-Type: application/json');
$result = shell_exec("python ../scripts/user_join.py $x  $y '$user' 2>&1 &");
echo str_replace("'", '"',$result);