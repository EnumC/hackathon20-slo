// BY Eric Qian @ enumc.com
// Also welcome to the source code :)
// MIT license applies

var url = undefined;
var enableTransaction = true;
url = window.location.href;
// alert(url);
var transactionID = undefined;
var cryptoSelected = "";
var amountCrypto = "";
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

function selectPaymentIL() {

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
            amountCrypto = items["amount_from"];
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
                if (ebay) 
                    fillPayment("ebay", "4767718242289561", "12/26", "006");
                else (amazon) 
                    fillPayment("amazon");
                clearInterval(checkStatus);
                vague.unblur();
                console.warn(items);
            }
		}).fail(function(e) {
			console.log(e);
		});
	  }, 5000); // check every 5s

}
if (url.startsWith("https://pay.ebay.com/rxo?action=view&")) {
    var ebay = true;
}
else if (url.startsWith(
		"https://smile.amazon.com/gp/buy/spc/handlers/display.html?hasWorkingJavascript=1"
	)) {
        var amazon = true;
    }

console.log(url);
if (amazon || ebay) {
	try {
        if (ebay) {
            var orderTotal = document
				.querySelectorAll("[data-test-id=TOTAL]")[0]
				.getElementsByClassName("amount")[0]
				.getElementsByTagName("span")[1]
				.innerText.substring(1);
        }
        else if (amazon) {
            var orderTotal = document
				.getElementsByClassName(
					"a-color-price a-size-medium a-text-right grand-total-price aok-nowrap a-text-bold a-nowrap"
				)[0]
				.innerText.substring(1);

        }
		
	} catch (e) {
		console.warn("total not found");
	}

	console.log("Order total", orderTotal);

	if (url.startsWith("https://pay.ebay.com/rxo?action=view&")) {
		var vague = $("#mainContent").Vague({ intensity: 10 });
	} else {
		var vague = $("#payment").Vague({ intensity: 10 });
	}
	vague.blur();

	$("head")
		.append(`<link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css">
      <div id="dialog" title="Transaction">
        <div id="selectorMenu">
            <h5>Welcome to Mercury - World Of Frictionless Payment</h5>
            <h6>Please select payment method: </h6>
            <div class="ui-grid-b">
                <img class="ui-block-a" style="width:25%; height: auto; float:left;" id="selectXRP" src="https://cdn4.iconfinder.com/data/icons/cryptocoins/227/XRP-alt-512.png"></img>
                <img class="ui-block-b" style="width:25%; height: auto; float:right;" id="selectETH" src="https://cdn4.iconfinder.com/data/icons/cryptocoins/227/ETH-512.png"></img>
                <img class="ui-block-c" style="width: 42%; height: auto; margin-top: 7%;" id="selectIL" src="https://miro.medium.com/max/646/1*2IYd3wa_Lg7TwmudoS-6fg.png"></img>

            </div>
        </div>
        
      </div>`);

	$(function() {
		$("#selectXRP").on("click", selectPaymentXRP);
		$("#selectETH").on("click", selectPaymentETH);
		$("#selectIL").on("click", selectPaymentIL);
		// var enableTransaction = false;
		$("#dialog").dialog();
		document.getElementsByClassName("ui-dialog")[0].focus();
		$("#dialog").focusout(function() {
			console.log("dialog lost focus");
			vague.unblur();
		});
		var checkFocus = setInterval(function() {
			if (!document.activeElement.hasAttribute("role")) {
				vague.unblur();
				clearInterval(checkFocus);
				// console.log("unblurring");
			} else {
				// vague.blur();
				// console.log("blurring");
			}
		}, 50);
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
    vague.unblur();
    switch (merchant) {
		case "ebay": {
			try {
				document
					.querySelectorAll("[data-test-id=SHOW_MORE]")[0]
					.click();
			} catch (e) {
				console.log("show more not available. not an issue.");
            }
            try {
                document
				.querySelectorAll("[data-test-id=GET_PAYMENT_INSTRUMENT]")[0]
				.click();
            } catch (e) {
                console.log("payment instrument not available. not an issue.");
            }
			
			var ifLoaded = setInterval(function() {
				if (document.getElementById("cardNumber")) {
					console.log("cardInputDialog detected");
					document.getElementById("cardNumber").value = card;
					document.getElementById("cardExpiryDate").value = expiry;
					document.getElementById("securityCode").value = seccode;
					document.getElementById("rememberCard").value = "off";
					document
						.querySelectorAll("[data-test-id=ADD_CARD]")[0]
						.click();

					document
						.querySelectorAll("[data-test-id=TOTAL]")[0]
						.getElementsByClassName("amount")[0]
						.getElementsByTagName("span")[1].innerText =
						cryptoSelected.toUpperCase() + " " + amountCrypto;

					clearInterval(ifLoaded);
				}
			}, 100); // check every 100ms
			break;
		}
		case "amazon": {
			try {
				document.getElementById("payChangeButtonId").click();
			} catch (e) {
				console.log("show more not available. not an issue.");
            }
            try {
                document
					.querySelectorAll(
						"[data-test-id=GET_PAYMENT_INSTRUMENT]"
					)[0]
					.click();
            }
            catch (e) {
                console.log("not fatal. cant get payment instrument");
            }
			
			var ifLoaded = setInterval(function() {
				if (document.getElementsByClassName('a-link-emphasis')[0]) {
					console.log("cardInputDialog detected");
					document.getElementsByClassName('a-link-emphasis')[0].click();
                    document.getElementsByName('addCreditCardNumber')[0].value = "4767718242289561";
                    document.getElementsByName('ppw-accountHolderName')[1].value = "PhoPayment";
                    document.getElementsByName('ppw-expirationDate_month')[0].value = 12;
                    document.getElementsByName('ppw-expirationDate_year')[0].value = 2026;
                    document.getElementsByName('ppw-widgetEvent:AddCreditCardEvent')[0].click();
					clearInterval(ifLoaded);
				}
			}, 100); // check every 100ms
			break;
		}
	}
}
