<?php

$id = intval($_REQUEST['id']);

$json_str = file_get_contents("pokedex.json");
$json_dict = json_decode($json_str, true);

echo json_encode($json_dict[$id]);

?>