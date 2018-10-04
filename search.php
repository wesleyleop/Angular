<?php
mb_internal_encoding("UTF-8");
// $mysqli = mysqli_connect('uvdb28.active24.cz', 'gastrobook', 'OQdj6i7ZMN', 'gastrobook');
$mysqli = mysqli_connect('localhost', 'myuser', 'mypass', 'gastrobook');
if (!$mysqli) throw new \Exception("Error Connection to DB", 1);
$tst = $mysqli->set_charset("utf8");

$post = file_get_contents('php://input');
$post = json_decode($post, true);

$search_lat = $mysqli->escape_string($post['position']['latitude']);
$search_lng = $mysqli->escape_string($post['position']['longitude']);
$rows = $mysqli->escape_string($_REQUEST['num'] ?: 5);
$page = $_REQUEST['page'] > 1 ? $_REQUEST['page'] : 1;
$offset = $mysqli->escape_string(($page -1) *$rows);


if(empty($post['keyword'])){
	$getSponzored = <<<SQL
	SELECT DISTINCT SQL_CALC_FOUND_ROWS rst.`id`,rst.`name`
		,rst.`www`,rst.`phone`,rst.`city`,rst.`street`
		,rst.`short_descr`,rst.`long_descr`
		, rst.`sponzored`, rst.`hl_colour`, rst.`highlight`, rst.`lang`
		-- ,rst.`latitude`,rst.`longitude`
		-- ,mlst.`name`,msgrp.`name`,mgrp.`name`,mtp.`name`	
		,SQRT(
			POW(rst.`latitude`-{$search_lat},2)+
			POW(rst.`longitude`-{$search_lng},2)
		) AS distance

	FROM `restaurant` AS rst
	ORDER BY distance
	LIMIT {$offset}, {$rows}
SQL;
}else{
	$where = array();
	foreach (explode(' ', $post['keyword']) as $txt) {
		$txt = $mysqli->escape_string($txt);
		$where[] = <<<SQL
		rst.`name` LIKE "%{$txt}%" OR rst.`short_descr` LIKE "%{$txt}%"
		OR mlst.`name` LIKE "%{$txt}%" OR mtp.`name` LIKE "%{$txt}%"
		OR msgrp.`name` LIKE "%{$txt}%" OR mgrp.`name` LIKE "%{$txt}%"
SQL;
	}
	$where = 'WHERE '.implode(PHP_EOL.' OR ', $where);


	$getSponzored = <<<SQL
	SELECT DISTINCT SQL_CALC_FOUND_ROWS rst.`id`,rst.`name`
		,rst.`www`,rst.`phone`,rst.`city`,rst.`street`
		,rst.`short_descr`,rst.`long_descr`
		, rst.`sponzored`, rst.`hl_colour`, rst.`highlight`, rst.`lang`
		-- ,rst.`latitude`,rst.`longitude`
		-- ,mlst.`name`,msgrp.`name`,mgrp.`name`,mtp.`name`	
		,SQRT(
			POW(rst.`latitude`-{$search_lat},2)+
			POW(rst.`longitude`-{$search_lng},2)
		) AS distance

	FROM `restaurant` AS rst
	LEFT JOIN `menu_list` AS mlst
		ON rst.id = mlst.ID_restaurant
	LEFT JOIN `menu_subgroup` AS msgrp
		ON msgrp.ID = mlst.ID_menu_subgroup
	LEFT JOIN `menu_group` AS mgrp
		ON mgrp.ID = msgrp.ID_menu_group
	LEFT JOIN `menu_type` AS mtp
		ON mtp.ID = mgrp.ID_menu_type

	{$where}

	ORDER BY distance
	LIMIT {$offset}, {$rows}
SQL;
}


$sql = "SELECT * FROM setting WHERE lang='ENG'";	
$result = $mysqli->query($sql)->fetch_assoc();
$limit_distance = $result['fp_radius'];

$sponzoredRid = -1; 
// echo date("l jS \of F Y h:i:s A"); echo "<br>";	
if ($result = $mysqli->query($getSponzored)) {
	$total = $mysqli->query('SELECT FOUND_ROWS()')->fetch_row()[0];
	// $total = $result->num_rows;
	while ($row = $result->fetch_assoc()) {

		$item_photos = array(); 
		$getPhotos = "SELECT id,upload_directory,minified_image_name FROM photo WHERE item_id=".$row['id']." AND (item_type = 'exterior' OR item_type = 'interior') ORDER BY item_type ASC";
		if($resultPhotos = $mysqli->query($getPhotos)){
			while ($items_photo = $resultPhotos->fetch_assoc()) {
				$photo_path = $items_photo['upload_directory'].$items_photo['minified_image_name'];
				array_push($item_photos,$photo_path); 
			}
		}

		$response['data'][$row['id']] = $row;
		$response['data'][$row['id']]['photos'] = $item_photos;
		$response['data'][$row['id']]['distance'] = number_format($row['distance']*78.5, 1);

		if ($row['sponzored'] > 0 && $row['distance']*1000*78.5<$limit_distance){
			$item_photos = array(); 			
			$getPhotos = "SELECT id,upload_directory,minified_image_name FROM photo WHERE item_id=".$row['id']." AND (item_type = 'exterior' OR item_type = 'interior') ORDER BY item_type ASC";
			if($resultPhotos = $mysqli->query($getPhotos)){
				while ($items_photo = $resultPhotos->fetch_assoc()) {
					$photo_path = $items_photo['upload_directory'].$items_photo['minified_image_name'];
					array_push($item_photos,$photo_path); 
				}
			}
			$response['sponzoredRestaurant'] = $row;
			$response['sponzoredRestaurant']['photos'] = $item_photos;
			$sponzoredRid = $row['id'];
			break;
		}
	}
	$result->free();

// $sql = <<<SQL
// SELECT DISTINCT SQL_CALC_FOUND_ROWS rst.`id`,rst.`name`
// 	,rst.`www`,rst.`phone`,rst.`city`,rst.`street`
// 	,rst.`short_descr`,rst.`long_descr`
// 	, rst.`sponzored`, rst.`hl_colour`, rst.`highlight`, rst.`lang`
// 	#,rst.`latitude`,rst.`longitude`
// 	#,mlst.`name`,msgrp.`name`,mgrp.`name`,mtp.`name`
// 	-- ,CONCAT(photo.upload_directory,photo.minified_image_name) AS photos
// 	,SQRT(
// 		POW(rst.`latitude`-{$search_lat},2)+
// 		POW(rst.`longitude`-{$search_lng},2)
// 	) AS distance

// FROM `restaurant` AS rst
// -- LEFT JOIN (SELECT * from `photo` WHERE minified_image_name IS NOT NULL LIMIT 1 )  AS photo
// -- 	ON rst.id = photo.item_id AND (photo.item_type = 'exterior' OR photo.item_type = 'interior')
// LEFT JOIN `menu_list` AS mlst
// 	ON rst.id = mlst.ID_restaurant
// LEFT JOIN `menu_subgroup` AS msgrp
// 	ON msgrp.ID = mlst.ID_menu_subgroup
// LEFT JOIN `menu_group` AS mgrp
// 	ON mgrp.ID = msgrp.ID_menu_group
// LEFT JOIN `menu_type` AS mtp
// 	ON mtp.ID = mgrp.ID_menu_type

// {$where}

// ORDER BY distance
// LIMIT {$offset}, {$rows}
// SQL;

// if ($result = $mysqli->query($sql)) {		
// 	while ($row = $result->fetch_assoc()) {
// 		$item_photos = array(); 
// 		$getPhotos = "SELECT id,upload_directory,minified_image_name FROM photo WHERE item_id=".$row['id']." AND (item_type = 'exterior' OR item_type = 'interior') ORDER BY item_type ASC";
// 		if($resultPhotos = $mysqli->query($getPhotos)){
// 			while ($items_photo = $resultPhotos->fetch_assoc()) {
// 				$photo_path = $items_photo['upload_directory'].$items_photo['minified_image_name'];
// 				array_push($item_photos,$photo_path); 
// 			}
// 		}

// 		$response['data'][$row['id']] = $row;
// 		$response['data'][$row['id']]['photos'] = $item_photos;
// 		$response['data'][$row['id']]['distance'] = number_format($row['distance']*78.5, 1);
// 	}
// 	$result->free();

	$response['data'] = array_values($response['data']);	
	// $total = $mysqli->query('SELECT FOUND_ROWS()')->fetch_row()[0];

	$filtered = $response['data'];
	$ip = $_SERVER['REMOTE_ADDR']?:($_SERVER['HTTP_X_FORWARDED_FOR']?:$_SERVER['HTTP_CLIENT_IP']);	
	foreach ($filtered as $key => $val) {
		$sql = "SELECT * FROM restaurant_view WHERE ID_restaurant=".$val['id']." AND IP='".$ip."' AND disp_type='G' ORDER BY view_time desc";	
		$result = $mysqli->query($sql);
		$row = $result->fetch_assoc();
		if (count($row)>0){
			$current_data = date("Y-m-d H:i:s"); 
			if(substr($current_data,8,2)>substr($row['view_time'],8,2)){  
				$sql = "INSERT INTO `restaurant_view`(`ID_restaurant`, `IP`, `disp_type`) VALUES (".$val['id'].",'".$ip."', 'G')";
				$mysqli->query($sql);

				$sql = "SELECT `id`, `sponzored`, `highlight` FROM `restaurant` WHERE id=".$val['id'];
				$result = $mysqli->query($sql);
				$viewed_r = $result->fetch_assoc();
				if ($val['id'] == $sponzoredRid) --$viewed_r['sponzored'];   //SPONZORED
				if ($viewed_r['highlight']>0) --$viewed_r['highlight'];   //HIGHLIGHT
				$sql = "UPDATE `restaurant` SET sponzored=".$viewed_r['sponzored'].", highlight=".$viewed_r['highlight']." WHERE id=".$viewed_r['id']; 
				$result = $mysqli->query($sql);				
			}
		}
		else{
			$sql = "INSERT INTO `restaurant_view`(`ID_restaurant`, `IP`, `disp_type`) VALUES (".$val['id'].",'".$ip."', 'G')";
			$mysqli->query($sql);

			$sql = "SELECT `id`, `sponzored`, `highlight` FROM `restaurant` WHERE id=".$val['id'];
			$result = $mysqli->query($sql);
			$viewed_r = $result->fetch_assoc();
			if ($val['id'] == $sponzoredRid) --$viewed_r['sponzored'];   //SPONZORED
			if ($viewed_r['highlight']>0) --$viewed_r['highlight'];   //HIGHLIGHT
			$sql = "UPDATE `restaurant` SET sponzored=".$viewed_r['sponzored'].", highlight=".$viewed_r['highlight']." WHERE id=".$viewed_r['id']; 
			$result = $mysqli->query($sql);
		}
	}
	if(!isset($response['sponzoredRestaurant'])) $response['sponzoredRestaurant'] = $response['data'][0];
	mysqli_close($mysqli);

	$response['googleRestaurants'] = array();
	$mysqli_gastrogoog = mysqli_connect('localhost', 'myuser', 'mypass', 'gastrogoog');
	// $mysqli_gastrogoog = mysqli_connect('uvdb31.active24.cz', 'gastrogoog', 'A5RjJNdQ', 'gastrogoog');
	if (!$mysqli_gastrogoog) throw new \Exception("Error Connection to DB", 1);
	foreach ($filtered as $key => $val) {
		$sql = "SELECT s_result FROM search_result WHERE ID_restaurant=".$val['id'];	
		$result = $mysqli_gastrogoog->query($sql);
		$row = $result->fetch_assoc();
		if (count($row)>0){
			array_push($response['googleRestaurants'], json_decode($row['s_result'], JSON_UNESCAPED_SLASHES));
		}else{
			$gricode=@file_get_contents('https://www.googleapis.com/customsearch/v1?lr=lang_cs&key=AIzaSyD1v6p9-NzUEwVraTp82KbX-knSXpB-9AM&cx=016001325367024894947:mdw4ssol40i&q='.urlencode($val['name']).''); 			
			if ($gricode === FALSE){
				// Error
			}
			else {
				$gres = json_decode($gricode);
				if(isset($gres->items)){
					$s_result = mysqli_real_escape_string($mysqli_gastrogoog, json_encode($gres->items));
					$sql = "INSERT INTO `search_result`(`ID_restaurant`, `s_result`) VALUES (".$val['id'].",'".$s_result."')";
					$mysqli_gastrogoog->query($sql);
					array_push($response['googleRestaurants'], $gres->items);
				}
			}
		}
	}
	mysqli_close($mysqli_gastrogoog); //key=AIzaSyAY3UfrThS4v3ZL4izo0e3Z794vyS3TnhY   key=AIzaSyD1v6p9-NzUEwVraTp82KbX-knSXpB-9AM

	$response['meta']['pagination'] = array(
		'count' => (int) count($response['data']),
		'total_pages' => (int) ceil($total/$rows),
		'current_page' => (int) $page,
		'per_page' => (int) $rows,
		'total' => (int) $total,
	);
} else {
	$response['data'] = array();
	$response['meta']['pagination'] = array(
		'count' => 0,
		'total_pages' => 0,
		'current_page' => (int) $page,
		'per_page' => (int) $rows,
		'total' => 0,
		'links' => array(),
		);
}

header("Content-type: application/json; charset=utf-8");
header("Access-Control-Allow-Headers:AUTHORIZATION, CONTENT-TYPE");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Origin:*");
header("Allow:GET,HEAD,POST");

// echo '<pre>'; var_dump($_REQUEST, $response, $tst
// 	,json_encode($response), $mysqli->character_set_name()
// 	); echo '</pre>'; exit;
echo json_encode($response);
// exit;
?>




