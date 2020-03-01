<?php

$DEBUG = false;

header("Access-Control-Allow-Origin: *");
header('Content-type: application/json');

$APIResult = array('success' => false,
    'inputCoinType' => 'unknown',
    'inputAddress' => 'unknown',
    'cardNumber' => 'unknown',
    'cardExpiryDate' => 'unknown',
    'securityCode' => 'unknown',
    'value' => 'unknown');

// returns true if $needle is a substring of $haystack

function contains($needle, $haystack)
{
    return strpos($haystack, $needle) !== false;
}

function xor_string($string, $key)
{
    for ($i = 0; $i < strlen($string); $i++) {
        $string[$i] = ($string[$i] ^ $key[$i % strlen($key)]);
    }

    return $string;
}

$requestInfo = filter_input(INPUT_GET, "request", FILTER_SANITIZE_STRING);
$total = filter_input(INPUT_GET, "total", FILTER_SANITIZE_STRING);
$crypto = filter_input(INPUT_GET, "crypto", FILTER_SANITIZE_STRING);
$idCode = filter_input(INPUT_GET, "id", FILTER_SANITIZE_STRING);

if ($DEBUG) {

    echo "requestInfo: " . $requestInfo;

    echo "<br><br>";

}
switch ($requestInfo) {
    case "getAllCurrency":
        if ($DEBUG) {

            echo json_encode(json_decode(getAllCurrency()), JSON_PRETTY_PRINT);
        } else {
            echo getAllCurrency();
        }

        die();
        break;
    case 'transaction_test':

        if ($DEBUG) {
            echo json_encode(json_decode(initializeTransaction($total, $crypto)), JSON_PRETTY_PRINT);

        } else {
            echo initializeTransaction($total, $crypto);
        }

        die();
        break;
    case 'checkTransaction':
        die(checkTransaction($idCode));
        break;
    default:
        die("error no request");
        break;
}

if (strlen($requestInfo) == 0) {

    $APIResult['success'] = false;

    $APIResult['message'] = "A required field is missing [requestInfo]";

    die(json_encode($APIResult));

}

function getCoinPaymentAddress()
{
    $APIResult['inputCoinType'] = $_GET["coin"];

}

function getAllCurrency()
{
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, 'https://api.simpleswap.io/get_all_currencies');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    $result = curl_exec($ch);
    if (curl_errno($ch)) {
        echo 'Error:' . curl_error($ch);
    }
    curl_close($ch);
    return $result;
}

function initializeTransaction($totaldollarvalue, $type)
{
    // $usdToCrypto = json_decode(checkExchangeValue('1', $type));
    // $typeValue = $totaldollarvalue * $usdToCrypto;

    $usdToCrypto = json_decode(checkExchangeValue($totaldollarvalue, $type));
    $typeValue = adjustExchangeSpread($usdToCrypto);

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, 'https://api.simpleswap.io/create_exchange?api_key=e32ed359-c081-4091-8c96-01a100c680d0');
    // curl_setopt($ch, CURLOPT_URL, 'https://ptsv2.com/t/p0eje-1583010392/post');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, "{\"currency_from\":\"" . $type . "\",\"currency_to\":\"tusd\",\"address_to\":\"0xC38EeC24a49c7937eEe55E47C06242396E86373D\",\"amount\":\"" . $typeValue . "\"}");
    curl_setopt($ch, CURLOPT_POST, 1);

    $headers = array();
    $headers[] = 'Content-Type: application/json; charset=utf-8';
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $result = curl_exec($ch);
    if (curl_errno($ch)) {
        echo 'Error:' . curl_error($ch);
    }
    curl_close($ch);
    return $result;

}

function checkExchangeValue($value, $type)
{
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, 'https://api.simpleswap.io/get_estimated?currency_from=tusd&currency_to=' . $type . '&amount=' . $value);
    // curl_setopt($ch, CURLOPT_URL, 'https://api.simpleswap.io/get_estimated?api_key=e32ed359-c081-4091-8c96-01a100c680d0&fixed=false&currency_from=tusd&currency_to='.$type .'&amount='.$value);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    $result = curl_exec($ch);
    if (curl_errno($ch)) {
        echo 'Error:' . curl_error($ch);
    }
    curl_close($ch);

    return $result;

}

function adjustExchangeSpread($value)
{
    return $value * 1.05;
}

function checkTransaction($idCode)
{
    if ($idCode) {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, 'https://api.simpleswap.io/get_exchange?id=' . $idCode);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }
        curl_close($ch);

        return $result;

    }
    else {
        return "no code.";
    }
}

if ($requestInfo == "") {
    $APIResult['message'] = '';

}

die(json_encode($APIResult));
