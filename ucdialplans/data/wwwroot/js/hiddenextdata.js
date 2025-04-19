function WriteHiddenExtData() {
    var i = 0;
    var e = document.getElementById('HiddenExtData');

    for (i = 0; i <= 49; i++) {
        e.insertAdjacentHTML("beforeend", "<DIV><input type='hiddendata' name='ExtName" + i + "' id='ExtName" + i + "' class='display-none'>"
            + "<input type='checkbox' name='DID" + i + "' id='DID" + i + "' value='Yes' class='display-none'>"
            + "<input type='checkbox' name='SingleNum" + i + "' id='SingleNum" + i + "' value='Yes' class='display-none'>"
            + "<input type='text' name='Base" + i + "' id='Base" + i + "' class='display-none'>"
            + "<input type='text' name='Start" + i + "' id='Start" + i + "' class='display-none'>"
            + "<input type='text' name='End" + i + "' id='End" + i + "' class='display-none'>"
            + "<input type='text' name='ExtDigits" + i + "' id='ExtDigits" + i + "' class='display-none'>"
            + "<input type='checkbox' name='LyncOnly" + i + "' id='LyncOnly" + i + "' value='Yes' class='display-none'>"
            + "</DIV>");
    }
}
WriteHiddenExtData();