// Numbers page
function bin2dec()
{
    var binaryValue = 
    document.getElementById("bin2dec-input").value;
    var regex = RegExp("\\b[01]+\\b");
    if (regex.test(binaryValue) == false)
    {
        document.getElementById("bin2dec-error").innerHTML = "Please enter a valid binary number! (Only 1s and 0s)" 
        return;
    }
    document.getElementById("bin2dec-error").innerHTML = "";
    var result = 0;
    for (var i = 0; i < binaryValue.length; i++)
    {
        result = result + (binaryValue[i] * Math.pow(2, (binaryValue.length - i - 1)));
    }
    document.getElementById("bin2dec-output").value = result.toString();    
}
function dec2bin()
{
    var decimalValue = 
    document.getElementById("dec2bin-input").value;
    var result = "";
    while(decimalValue >= 1)
    {
        result = (decimalValue % 2).toString() + result;
        decimalValue = Math.trunc(decimalValue / 2);
    }
    document.getElementById("dec2bin-output").value = result;
}