<?php
	#header('Content-Type: application/json');
	$jsonString = file_get_contents('php://input');
	
	file_put_contents('zz_received_data_log.txt', $jsonString . "\r\n", FILE_APPEND);

	$phpObj = json_decode($jsonString,true);

	$sendData = array( 
		'button' => $phpObj['button'],
		'success' => 'ohyeah',
		'confirm' => 'rogerthat'
		);

	// add to sending json x, y shift value
	if ($phpObj['button'] == 'up') {
		$sendData['y'] = '-1';
	}
	elseif ($phpObj['button'] == 'down') {
		$sendData['y'] = '2';	
	}
	elseif ($phpObj['button'] == 'right') {
		$sendData['x'] = '3';	
	}
	elseif ($phpObj['button'] == 'left') {
		$sendData['x'] = '-4';	
	}

	//sleep(5);
	echo json_encode($sendData);
?>