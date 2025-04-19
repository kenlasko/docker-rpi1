// Define all listeners
window.addEventListener('load', (event) => {
	ResetForm();
});

document.getElementById('ExtSubmitButton').addEventListener('click', (event) => {
	ValidateandSend();
});



var dataObject = [
	{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
];
var hotElement = document.querySelector('#hot');
var hotElementContainer = hotElement.parentNode;

var e164_validator_regexp = /^((1[2-9]\d\d[2-9]\d{0,6})|([2-9]\d{4,14}))$/;
var e164_validator_fn = function (value, callback) {
	setTimeout(function () {
		if (/^((1[2-9]\d\d[2-9]?\d{0,6})|([2-9]\d{4,14}))$/.test(value)) {
			callback(true);
		}
		else {
			callback(false);
			alert("Phone number base can only contain numbers.");
		}
	});
};

var numerictext0_validator_regexp = /^\d*$/;
var numerictext1_validator_regexp = /^\d+$/;

var text_validator_fn = function (value, callback) {
	setTimeout(function () {
		if (/^[\w|-]*$/.test(value)) {
			callback(true);
		}
		else {
			callback(false);
			alert("Suffix can only include letters, numbers, dashes or underscore characters");
		}
	});
};


var hotSettings = {
	data: dataObject,
	licenseKey: "non-commercial-and-evaluation",
	columns: [
		{
			data: 'extName',
			type: 'text',
			width: 100,
			validator: text_validator_fn,
			allowInvalid: false
		},
		{
			data: 'DID',
			type: 'checkbox',
			className: 'htCenter',
			width: 36
		},
		{
			data: 'SingleNum',
			type: 'checkbox',
			className: 'htCenter',
			width: 36
		},
		{
			data: 'Base',
			type: 'text',
			validator: e164_validator_fn,
			allowInvalid: false
		},
		{
			data: 'extStart',
			type: 'text',
			width: 60,
			validator: numerictext1_validator_regexp,
			allowInvalid: false
		},
		{
			data: 'extEnd',
			type: 'text',
			width: 60,
			validator: numerictext0_validator_regexp,
			className: 'disableCell',
			readOnly: false,
			allowInvalid: false
		},
		{
			data: 'extDigits',
			type: 'dropdown',
			width: 50,
			className: 'disableCell',
			readOnly: false,
			source: []
		},
		{
			data: 'S4BOnly',
			type: 'checkbox',
			className: 'htCenter',
			width: 60
		},
		{
			data: 'Example',
			type: 'text',
			width: 180,
			readOnly: true
		}
	],
	stretchH: 'all',
	autoWrapRow: true,
	height: 770,
	maxRows: 50,
	minSpareRows: 1,
	allowRemoveColumn: false,
	allowInsertColumn: false,
	enterBeginsEditing: false,
	rowHeaders: true,
	colHeaders: [
		'Rule Suffix<div style="font-size: 0.8em">(Optional)</div><a onclick="popUp(\'help_suffix.htm\');"><i class="fa fa-question-circle fa-2x"></i></a>',
		'DID<br><a onclick="popUp(\'help_DID.htm\');"><i class="fa fa-question-circle fa-2x"></i></a>',
		'Single<br><a onclick="popUp(\'help_singlenum.htm\');"><i class="fa fa-question-circle fa-2x"></i></a>',
		'Main Number Prefix',
		'Extension<br>Start',
		'Extension<br>End',
		'# of Ext<br>Digits<br>in DID',
		'S4B Only<br><a onclick="popUp(\'help_s4bonly.htm\');"><i class="fa fa-question-circle fa-2x"></i></a>',
		'Normalized Example'
	],
	afterValidate: function (isValid, value, row, prop, source) {
		if (isValid) {
			if (prop === 'extEnd') {
				var endLength = value.toString().length;
				if (this.getDataAtCell(row, 4) !== null) {
					var startLength = this.getDataAtCell(row, 4).length;

					if ((endLength !== startLength) && (endLength !== 0)) {
						alert('Extension Start and Extension End must both be the same length');
						return false;
					}
					else {
						if ((value <= this.getDataAtCell(row, 4)) && (value > 0)) {
							alert('Extension End must be larger than Extension Start');
							return false;
						}
					}
				}
			}
		}
	},

	beforeChange: function (changes, source) {
		if (source === 'loadData' || changes.length === 1) {
			return;
		}

		for (var i = 0; i < changes.length; i++) {
			var row = changes[i][0];
			var prop = changes[i][1];
			var value = changes[i][3];

			if (prop === 'DID') {
				if (value.toUpperCase() === 'TRUE') {
					var extDigitsMeta = this.getCellMeta(row, 6);

					extDigitsMeta.className = (extDigitsMeta.className + '').replace('disableCell', '').trim();
					extDigitsMeta.readOnly = false;
					isDID = true;
				}
				else {
					isDID = false;
				}
			}
			else if (prop === 'extStart') {
				var iDigits = value.length;
				var extDigitsMeta = this.getCellMeta(row, 6);
				extDigitsMeta.source = [];

				// If DID is checked, then set the '# of Ext digits in DID' to match the number of digits in the extension
				if (isDID) {
					// Populate the dropdown box with digits corresponding to the number of digits in the extension
					for (var x = 1; x <= iDigits; x++) {
						extDigitsMeta.source.push(x.toString());
					}
					this.setDataAtCell(row, 6, iDigits.toString());
				}
				else {
					this.setDataAtCell(row, 6, '');
					extDigitsMeta.readOnly = true;
				}
			}
			else if (prop === 'extDigits') {
				// If DID is checked, then set the '# of Ext digits in DID' to match the number of digits in the extension
				if (isDID) {
					this.setDataAtCell(row, 6, value.toString());
				}
			}
		}
	},

	afterChange: function (changes, source) {
		if (source === 'loadData' || changes.length > 1) {
			return;
		}

		var row = changes[0][0];
		var prop = changes[0][1];
		var value = changes[0][3];

		if (prop === 'DID') {
			var extDigitsMeta = this.getCellMeta(row, 6);

			if ((value === true) && (this.getDataAtCell(row, 4) !== null)) {
				// Set Extension Digits to show as writable
				extDigitsMeta.className = (extDigitsMeta.className + '').replace('disableCell', '').trim();
				extDigitsMeta.readOnly = false;

				// If Extension start is already populated, then set the Extension Digits value to the length of the Extension Start
				//if (this.getDataAtCell(row,4) !== null){
				this.setDataAtCell(row, 6, this.getDataAtCell(row, 4).length.toString());
				//alert("Setting from DID to " + this.getDataAtCell(row,4).length);
				//}
			}
			else {
				// Disable the Extension Digits column
				extDigitsMeta.className = 'disableCell';
				this.setDataAtCell(row, 6, null);
				extDigitsMeta.readOnly = true;

				// If Single is checked, uncheck it
				if ((this.getDataAtCell(row, 2) === true) && (value === false)) {
					this.setDataAtCell(row, 2, false);
				}
			}
		}

		if (prop === 'SingleNum') {
			var extEndMeta = this.getCellMeta(row, 5);
			var extDigitsMeta = this.getCellMeta(row, 6);

			if (value === true) {
				// Enable DID checkbox 
				this.setDataAtCell(row, 1, true);
				// Disable Extension End and Extension Digits cells
				extEndMeta.className = 'disableCell';
				extDigitsMeta.className = 'disableCell';
				extEndMeta.readOnly = true;
				extDigitsMeta.readOnly = true;
			}
			else {
				// Set Extension Digits to show as writable
				extDigitsMeta.className = (extDigitsMeta.className + '').replace('disableCell', '').trim();
				extDigitsMeta.readOnly = false;

				// If Extension start is already populated, then set the Extension Digits value to the length of the Extension Start
				// and enable the Extension End cell
				if (this.getDataAtCell(row, 4) !== null) {
					this.setDataAtCell(row, 6, this.getDataAtCell(row, 4).length.toString());
					//alert("Setting from SingleNum to " + this.getDataAtCell(row,4).length);
					extEndMeta.className = (extEndMeta.className + '').replace('disableCell', '').trim();
					extEndMeta.readOnly = false;
				}
			}
		}

		if (prop === 'extStart') {
			var iDigits = value.length;
			var extEndMeta = this.getCellMeta(row, 5);
			var extDigitsMeta = this.getCellMeta(row, 6);

			extDigitsMeta.source = [];

			// Populate the dropdown box with digits corresponding to the number of digits in the extension
			for (i = 1; i <= iDigits; i++) {
				extDigitsMeta.source.push(i.toString());
			}

			// If DID is checked, then set the '# of Ext digits in DID' to match the number of digits in the extension
			// then update the example
			// Had to do a timeout because when loading previous entries, this would fire and cause the digit count to revert to default

			// Have to call a setTimeout for when importing from history
			// Couldn't figure out a nicer way to do this

			if ((window.opener.document.getElementById("Start" + row).value !== '') && (window.opener.document.getElementById("DID" + row).checked === true) && (window.opener.document.getElementById("SingleNum" + row).checked === false)) {
				setTimeout(function () {
					if ((this.getDataAtCell(row, 1) === true) && ((this.getDataAtCell(row, 2) === false) || (this.getDataAtCell(row, 2) === null))) {
						extDigitsMeta.className = (extDigitsMeta.className + '').replace('disableCell', '').trim();
						extDigitsMeta.readOnly = false;
						this.setDataAtCell(row, 6, iDigits.toString());
					}
					else {
						extDigitsMeta.className = 'disableCell';
						extDigitsMeta.readOnly = true;
						this.setDataAtCell(row, 6, '');
					}
				});
			}
			else {
				if ((this.getDataAtCell(row, 1) === true) && ((this.getDataAtCell(row, 2) === false) || (this.getDataAtCell(row, 2) === null))) {
					extDigitsMeta.className = (extDigitsMeta.className + '').replace('disableCell', '').trim();
					extDigitsMeta.readOnly = false;
					this.setDataAtCell(row, 6, iDigits.toString());
				}
				else {
					extDigitsMeta.className = 'disableCell';
					extDigitsMeta.readOnly = true;
					this.setDataAtCell(row, 6, '');
				}
			}

			if (this.getDataAtCell(row, 2) === true) {
				this.setDataAtCell(row, 5, '');
				extEndMeta.className = 'disableCell';
				extEndMeta.readOnly = true;
				extDigitsMeta.className = 'disableCell';
				extDigitsMeta.readOnly = true;
				this.setDataAtCell(row, 6, '');
			}

			// Clear out and disable 'Extension End' if Extension Start is blanked
			if ((value === '') || (value === null)) {
				this.setDataAtCell(row, 5, '');
				extEndMeta.className = 'disableCell';
				extEndMeta.readOnly = true;
			}
			else {
				extEndMeta.className = (extEndMeta.className + '').replace('disableCell', '').trim();
				extEndMeta.readOnly = false;
			}
		}

		if (prop === 'extDigits') {
			var Base = this.getDataAtCell(row, 3);
			var Start = this.getDataAtCell(row, 4);
			var End = this.getDataAtCell(row, 5);
			var extPrefix = Start.length - value;

			if ((typeof Start !== 'object') && (typeof End !== 'object')) {
				if ((Start.substring(0, extPrefix) !== End.substring(0, extPrefix)) && (this.getDataAtCell(row, 1) === true) && ((this.getDataAtCell(row, 2) === false) || (this.getDataAtCell(row, 2) === null)) && (End !== '')) {
					alert('With the selected setting, the first ' + extPrefix + ' digits of both Start and End must be the same.');
					this.setDataAtCell(row, 6, Start.length.toString());
				}
			}
		}

		if ((prop === 'DID') || (prop === 'Base') || (prop === 'extStart') || (prop === 'extDigits')) {
			this.setDataAtCell(row, 8, '+' + UpdateExample(row));
		}
	},
	contextMenu: true
};

var hot = new Handsontable(hotElement, hotSettings);


function UpdateExample(row) {
	var isDID = hot.getDataAtCell(row, 1);
	var isSingle = hot.getDataAtCell(row, 2);
	var iPrefix = hot.getDataAtCell(row, 3);
	var iStart = hot.getDataAtCell(row, 4);
	var iExtDigits = hot.getDataAtCell(row, 6);
	var strMid = '';
	var strSuffix = '';

	if (iPrefix === null) { iPrefix = '' }
	if (iStart === null) { iStart = '' }
	if (iExtDigits === null) { iExtDigits = 0 }

	if ((isDID === true) || (isDID === 'TRUE')) {
		strMid = '';
		strSuffix = iStart.substring(iStart.length - iExtDigits, iStart.length);
	}
	else {
		strMid = ';ext=';
		strSuffix = iStart;
	}

	if ((isSingle === true) || (isSingle === 'TRUE')) {
		strMid = '';
		strSuffix = '';
	}
	return iPrefix + strMid + strSuffix;
}

function ResetForm() {
	var i = 0;
	while (window.opener.document.getElementById("Base" + i).value !== "") {
		hot.setDataAtCell(i, 0, window.opener.document.getElementById("ExtName" + i).value);
		hot.setDataAtCell(i, 1, window.opener.document.getElementById("DID" + i).checked);
		hot.setDataAtCell(i, 2, window.opener.document.getElementById("SingleNum" + i).checked);
		hot.setDataAtCell(i, 3, window.opener.document.getElementById("Base" + i).value.replace("+", "")); // Strip incoming + from base number if it exists
		hot.setDataAtCell(i, 4, window.opener.document.getElementById("Start" + i).value);
		hot.setDataAtCell(i, 5, window.opener.document.getElementById("End" + i).value);
		hot.setDataAtCell(i, 7, window.opener.document.getElementById("LyncOnly" + i).checked);

		if (hot.getDataAtCell(i, 1) === true) {
			if (window.opener.document.getElementById("ExtDigits" + i).value != "") {
				hot.setDataAtCell(i, 6, window.opener.document.getElementById("ExtDigits" + i).value);
			}
		}

		i = i + 1;
	}
}


function ValidateandSend() {
	var ExtensionsExist = false;

	for (i = 0; i <= 49; i++) {
		// Only write data if there is data in both main number prefix and extStart columns
		window.opener.document.getElementById("ExtName" + i).value = hot.getDataAtCell(i, 0);
		window.opener.document.getElementById("DID" + i).checked = hot.getDataAtCell(i, 1);
		window.opener.document.getElementById("SingleNum" + i).checked = hot.getDataAtCell(i, 2);
		window.opener.document.getElementById("Base" + i).value = hot.getDataAtCell(i, 3);
		window.opener.document.getElementById("Start" + i).value = hot.getDataAtCell(i, 4);
		window.opener.document.getElementById("End" + i).value = hot.getDataAtCell(i, 5);

		if ((hot.getDataAtCell(i, 3) !== null) && (hot.getDataAtCell(i, 4) !== null)) {
			ExtensionsExist = true;

			if (hot.getDataAtCell(i, 6) === '') {
				window.opener.document.getElementById("ExtDigits" + i).value = "0";
			}
			else {
				window.opener.document.getElementById("ExtDigits" + i).value = hot.getDataAtCell(i, 6);
			}
			window.opener.document.getElementById("LyncOnly" + i).checked = hot.getDataAtCell(i, 7);
		}
	}

	if (ExtensionsExist === true) {
		window.opener.document.getElementById("Extensions").checked = true;
		window.opener.document.getElementById("ExtensionsButton").value = "Click to add/edit extensions";
	}
	else {
		window.opener.document.getElementById("Extensions").checked = false;
		window.opener.document.getElementById("ExtensionsButton").value = "Click to add extensions";
	}

	window.close();
}