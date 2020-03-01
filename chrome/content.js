// BY Eric Qian @ enumc.com
// Also welcome to the source code :)
// MIT license applies

var url = undefined;
var enableTransaction = true;
url = window.location.href;
// alert(url);
var transactionID = undefined;
var cryptoSelected = "";
function selectPaymentXRP() {
    // console.log(selectPayment.caller);
    cryptoSelected = "xrp";
    processTransaction();
}
function selectPaymentETH() {
	// console.log(selectPayment.caller);
    cryptoSelected = "eth";
    processTransaction();
}

function setCookie(cookieName, cookieValue, expiryInDays) {
	var expiryDate = new Date();
	expiryDate.setTime(
		expiryDate.getTime() + expiryInDays * 24 * 60 * 60 * 1000
	);
	var expires = "expires=" + expiryDate.toUTCString();
	document.cookie =
		cookieName + "=" + cookieValue + ";" + expires + ";path=/";
}

function getCookie(cookieName) {
	var name = cookieName + "=";
	var ca = document.cookie.split(";");
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}


function processTransaction() {
    $("#selectorMenu").remove();
    $("#dialog").append(
		`
        <h5>Order Details</h5>
        <h5 id="instruction"></h5>
        <h5 id="instructionB"></h5>
        <img src="https://i.imgur.com/oQbN0QC.gif" style="height: 150px; width: 150px;" id="qrcode">  </img>
        `
    );
    
    if (enableTransaction) {
		var backendURL =
			"https://gravity.enumc.com/processRequest.php?request=transaction_test&total=" +
			orderTotal +
			"&crypto=" +
			cryptoSelected;
        console.log(backendURL);
		$.getJSON(backendURL, function(data) {
			let items = {};
			$.each(data, function(key, val) {
				items[key] = val;
			});

			// if (items["message"] != "invalid" && items["message"] != "undefined" && items["message"] != "unknown") {

			// }
            console.log(items);
            setCookie("idTransaction", items["id"], 365);
            transactionID = items["id"];
            console.warn(transactionID);
            var currencyPrefix;
            if (cryptoSelected.toUpperCase() == 'XRP'){
                currencyPrefix = "ripple";
            }
            else if (cryptoSelected.toUpperCase() == "ETH") {
						currencyPrefix = "ethereum";
					} else {
						currencyPrefix = cryptoSelected.toLowerCase();
					}
			$("#qrcode").attr(
				"src",
				"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" +
					currencyPrefix +
					":" +
					items["address_from"] +
					"?amount=" +
					items["amount_from"]
			);
			$("#instruction").text(
				parseFloat(items["amount_from"]).toFixed(6) +
					" " +
					items["currency_from"].toUpperCase() +
					" => " +
					// items["amount_to"] +
                    // " USD"
                    orderTotal + " USD"
			);
			$("#instructionB").text(
				"Please deposit ONLY " +
					items["currency_from"].toUpperCase() +
					" to the following address. "
			);
		}).fail(function(e) {
			console.log(e);
		});
	} else {
		$("#instruction").text("DEBUG: Transaction is disabled.");
		$("#qrcode").attr("src", "");
    }
    

    
    
 
  
    var checkStatus = setInterval(function() {
           var statusURL =
				"https://gravity.enumc.com/processRequest.php?request=checkTransaction&id=" +
				transactionID;
			console.log(statusURL);
	    $.getJSON(statusURL, function(data) {
			let items = {};
			$.each(data, function(key, val) {
				items[key] = val;
			});

			// if (items["message"] != "invalid" && items["message"] != "undefined" && items["message"] != "unknown") {

            // }
			console.log(items);
			if (items["status"] != "waiting" && items["status"]) {
                $("#qrcode").remove();
                $("#instruction").text("Transaction received! Press confirm purchase to finish your transaction.");
                fillPayment("ebay", "4767718242289561", "12/26", "006");
                clearInterval(checkStatus);
                console.warn(items);
            }
		}).fail(function(e) {
			console.log(e);
		});
	  }, 5000); // check every 5s

}
console.log(url);
if (url.startsWith("https://pay.ebay.com/rxo?action=view&")) {
	var orderTotal = document
		.querySelectorAll("[data-test-id=TOTAL]")[0]
		.getElementsByClassName("amount")[0]
		.getElementsByTagName("span")[1]
		.innerText.substring(1);
    console.log("Order total", orderTotal);
    

	$("head")
		.append(`<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
      <div id="dialog" title="Transaction">
        <div id="selectorMenu">
            <h5>Welcome to duo - The New Way To Pay</h5>
            <h6>Please select payment method: </h6>
            <div class="ui-grid-a">
                <img class="ui-block-a" style="width:25%; height: auto; float:left;" id="selectXRP" src="https://cdn4.iconfinder.com/data/icons/cryptocoins/227/XRP-alt-512.png"></img>
                <img class="ui-block-b" style="width:25%; height: auto; float:right;" id="selectETH" src="https://cdn4.iconfinder.com/data/icons/cryptocoins/227/ETH-512.png"></img>
            </div>
        </div>
        
      </div>`);

	$(function() {
        $("#selectXRP").on("click", selectPaymentXRP);
        $("#selectETH").on("click", selectPaymentETH);
		// var enableTransaction = false;
        $("#dialog").dialog();
        // $("#menu").menu();

		
	});

	console.log("detected ebay checkout. Attempting to fill");
	//   document.querySelectorAll("[data-test-id=SHOW_MORE]")[0].click();
	//   document.querySelectorAll("[data-test-id=GET_PAYMENT_INSTRUMENT]")[0].click();
	//   var ifLoaded = setInterval(function() {
	//     if (document.getElementById("cardNumber")) {
	//       console.log("cardInputDialog detected");
	//       document.getElementById("cardNumber").value = "4767718242289561";
	//       document.getElementById("cardExpiryDate").value = "12/26";
	//       document.getElementById("securityCode").value = "006";
	//       document.getElementById("rememberCard").value = "off";
	//       document.querySelectorAll("[data-test-id=ADD_CARD]")[0].click();
	//       clearInterval(ifLoaded);
	//     }
	//   }, 100); // check every 100ms
}

function fillPayment(merchant, card,expiry,seccode) {
    switch (merchant) {
        case "ebay": {
							  document.querySelectorAll("[data-test-id=SHOW_MORE]")[0].click();
							  document.querySelectorAll("[data-test-id=GET_PAYMENT_INSTRUMENT]")[0].click();
							  var ifLoaded = setInterval(function() {
							    if (document.getElementById("cardNumber")) {
							      console.log("cardInputDialog detected");
							      document.getElementById(
										"cardNumber"
									).value = card;
							      document.getElementById(
										"cardExpiryDate"
									).value = expiry;
							      document.getElementById(
										"securityCode"
									).value = seccode;
							      document.getElementById("rememberCard").value = "off";
							      document.querySelectorAll("[data-test-id=ADD_CARD]")[0].click();
							      clearInterval(ifLoaded);
							    }
							  }, 100); // check every 100ms
						}
    }
}