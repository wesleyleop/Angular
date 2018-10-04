<?php
mb_internal_encoding("UTF-8");
// $mysqli = mysqli_connect('uvdb28.active24.cz', 'gastrobook', 'OQdj6i7ZMN', 'gastrobook');
$mysqli = mysqli_connect('localhost', 'myuser', 'mypass', 'gastrobook');
if (!$mysqli) throw new \Exception("Error Connection to DB", 1);
$mysqli->set_charset("utf8");

$ip = $_SERVER['REMOTE_ADDR']?:($_SERVER['HTTP_X_FORWARDED_FOR']?:$_SERVER['HTTP_CLIENT_IP']);	
$restaurantid = $_GET['id'];
$insertView = "INSERT INTO restaurant_click (ID_restaurant, IP, click_at) VALUES (".$restaurantid.", '".$ip."', 'G')";
// $mysqli->query($insertView);
echo json_encode($mysqli->query($insertView));
mysqli_close($mysqli);
?>