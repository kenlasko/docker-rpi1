// Define all listeners
window.addEventListener('load', VerifyParent);

document.querySelectorAll('#RulesetTable tr').forEach(TableRow => {
	TableRow.addEventListener('click', (event) => {
		popUp('GetHistory.cshtml?UserID3=' + event.target.parentElement.getAttribute("data-UserID"));
		event.stopPropagation();
	});
});

document.querySelectorAll('.extension-button').forEach(ExtensionRow => {
	ExtensionRow.addEventListener('click', (event) => {
		popUp('GetExtHistory.cshtml?ID=' + event.target.parentElement.parentElement.id);
		event.stopPropagation();
	});
});

function popUp(URL) {
	var day = new Date();
	var id = day.getTime();
	var pageid = "page" + id;

	pageid = window.open(URL, '" + id + "', 'toolbar=0,scrollbars=1,location=0,directories=0,statusbar=0,menubar=0,dependent=0,resizable=1,width=950,height=900,left=200,top=20');
}

function VerifyParent() {
	// If someone attempts to open the page independently of the Optimizer, redirect to the main page
	if (!(window.opener && window.opener.open && !window.opener.closed)) {
		window.location = "http://www.ucdialplans.com/";
	}
}

function QueryDB(querytype, ID, async) {
	//Queries the SQL database for single values used in the page
	//Dynamically updates via JSON

	var xmlhttp;
	var strResponse;

	xmlhttp = new XMLHttpRequest();

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			strResponse = xmlhttp.responseText;
		}
	}
	xmlhttp.open("GET", "QueryDB.cshtml?Query=" + querytype + "&ID=" + ID, async);
	xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	xmlhttp.setRequestHeader("charset", "utf-8");

	xmlhttp.send();
	return strResponse;
}



//function LoadinParent(RuleID, CountryID, RegionID, GWType, City, StateProv, NPA, NXX, CaribDialing, SimpleRules, ChangeRule, EnglishRules, Extensions, SevenDigitRules, SIPTrunk, BlockPrem, CallPark, CallParkStart, CallParkEnd, ExtAccessNum, CarrierCode, IntlCarrierCode, BlockCallIDCode, BlockCallIDRepl, Email) {
//	var cNANPACountries = "AI,AN,AS,BA,BD,BM,BV,CA,CQ,DM,DR,GN,GU,JM,KA,LC,MP,PR,RT,SM,TC,TT,US,VI,ZF"

//	if (cNANPACountries.indexOf(CountryID) > -1) {
//		CountryID = "NN"
//	}

//	window.opener.document.getElementById("Country").value = CountryID;
//	window.opener.document.getElementById("GWType").value = GWType;

//	switch (CountryID) {
//		case "CA":
//		case "US":
//		case "NN":
//			window.opener.document.getElementById("NANPA").value = NPA;
//			window.opener.document.getElementById("NANXX").value = NXX;
//			window.opener.document.getElementById("NANPADialing").value = CaribDialing;
//			break;

//		case "DE":
//		case "IN":
//		case "MX":
//		case "NZ":
//			window.opener.document.getElementById("NPAType").value = NPA;
//			window.opener.AreaCodeEntry();
//			window.opener.document.getElementById("NPADrop").value = RegionID;
//			if (!ChangeRule) { ChangeRule = City; alert('ChangeRule to ' + City); }
//			break;

//		default:
//			window.opener.document.getElementById("NPADrop").value = RegionID;
//			window.opener.ResetOptions();
//	}

//	window.opener.UpdateFormData();

//	if (SimpleRules == 1) {
//		window.opener.document.getElementById("SimpleRules").value = "Yes";
//	}
//	else {
//		window.opener.document.getElementById("SimpleRules").value = "No";
//	}

//	//window.opener.UpdateFormData();


//	if (EnglishRules == 1) {
//		window.opener.document.getElementById("EnglishRules").value = "Yes";
//	}
//	else {
//		window.opener.document.getElementById("EnglishRules").value = "No";
//	}

//	if (Extensions == 1) {
//		// Get the list of extensions for the selected ruleset
//		var i = 0;
//		var ExtLineItem;
//		var ExtList = QueryDB('ExtensionList', RuleID, false);
//		var ExtArray = ExtList.split("\n");

//		for (i = 0; i < ExtArray.length - 1; i++) {
//			if (ExtArray[i].indexOf(",") > 0) { // Verify that the selected item has items on it (with separating commas)
//				ExtLineItem = ExtArray[i].split(",");
//				window.opener.document.getElementById("ExtName" + i).value = ExtLineItem[0];
//				window.opener.document.getElementById("DID" + i).checked = (ExtLineItem[1] == 1);
//				window.opener.document.getElementById("SingleNum" + i).checked = (ExtLineItem[2] == 1);
//				window.opener.document.getElementById("LyncOnly" + i).checked = (ExtLineItem[3] == 1);
//				window.opener.document.getElementById("Base" + i).value = ExtLineItem[4].replace("+", "");
//				window.opener.document.getElementById("Start" + i).value = ExtLineItem[5];
//				window.opener.document.getElementById("End" + i).value = ExtLineItem[6];
//				window.opener.document.getElementById("ExtDigits" + i).value = ExtLineItem[7];
//			}
//		}

//		// Clear out the remainder of the extension blocks in case there's stuff there from previous entries
//		var x = 0;
//		for (x = i; x < 49; x++) {
//			window.opener.document.getElementById("ExtName" + x).value = "";
//			window.opener.document.getElementById("DID" + x).checked = false;
//			window.opener.document.getElementById("SingleNum" + x).checked = false;
//			window.opener.document.getElementById("Base" + x).value = "";
//			window.opener.document.getElementById("Start" + x).value = "";
//			window.opener.document.getElementById("End" + x).value = "";
//			window.opener.document.getElementById("ExtDigits" + x).value = "";
//		}
//		// Set the Extensions button to say Add/Edit
//		window.opener.document.getElementById("Extensions").checked = true;
//		window.opener.document.getElementById("ExtensionsButton").value = "Click to add/edit extensions";
//	}
//	else {
//		var x = 0;
//		for (x = 0; x < 49; x++) {
//			window.opener.document.getElementById("ExtName" + x).value = "";
//			window.opener.document.getElementById("DID" + x).checked = false;
//			window.opener.document.getElementById("SingleNum" + x).checked = false;
//			window.opener.document.getElementById("Base" + x).value = "";
//			window.opener.document.getElementById("Start" + x).value = "";
//			window.opener.document.getElementById("End" + x).value = "";
//			window.opener.document.getElementById("ExtDigits" + x).value = "";
//		}
//		// Set the Extensions button to say Add
//		window.opener.document.getElementById("Extensions").checked = false;
//		window.opener.document.getElementById("ExtensionsButton").value = "Click to add extensions";
//	}

//	if (SIPTrunk == 1) { window.opener.document.getElementById("SIPTrunk").value = "Yes"; }

//	if (SevenDigitRules == 1) {
//		window.opener.document.getElementById("SevenDigit").value = "Yes";
//	}
//	else {
//		window.opener.document.getElementById("SevenDigit").value = "No";
//	}

//	if (BlockPrem == 1) {
//		window.opener.document.getElementById("BlockPrem").value = "Yes";
//	}
//	else {
//		window.opener.document.getElementById("BlockPrem").value = "No";
//	}

//	window.opener.document.getElementById("CallPark").checked = (CallPark == "True");
//	window.opener.document.getElementById("CallParkStart").value = CallParkStart;
//	window.opener.document.getElementById("CallParkEnd").value = CallParkEnd;
//	window.opener.document.getElementById("ExtAccessNum").value = ExtAccessNum;
//	window.opener.document.getElementById("CarrierCode").value = CarrierCode;
//	window.opener.document.getElementById("BlockCallIDCode").value = BlockCallIDCode;
//	window.opener.document.getElementById("BlockCallIDRepl").value = BlockCallIDRepl;
//	window.opener.document.getElementById("Email").value = Email;

//	if (ChangeRule != "") {
//		window.opener.document.getElementById("ChangeRule").value = ChangeRule;
//	}

//	window.opener.UpdateSampleRule();
//	window.close();
//}