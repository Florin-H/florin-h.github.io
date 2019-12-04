// Numbers page
function bin2dec()
{
    var binaryValue = 
    document.getElementById("bin-input-text").value;
    var regex = RegExp("\\b[01]+\\b");
    if (regex.test(binaryValue) == false)
    {
        document.getElementById("std-error").innerHTML = "Please enter a valid binary number! (Only 1s and 0s)" 
        return;
    }
    document.getElementById("std-error").innerHTML = "";
    var result = 0;
    for (var i = 0; i < binaryValue.length; i++)
    {
        result = result + (binaryValue[i] * Math.pow(2, (binaryValue.length - i - 1)));
    }
    document.getElementById("dec-output-text").value = result.toString();    
}
function dec2bin()
{
    var decimalValue = 
    document.getElementById("dec-input-number").value;
    var result = "";
    while(decimalValue >= 1)
    {
        result = (decimalValue % 2).toString() + result;
        decimalValue = Math.trunc(decimalValue / 2);
    }
    document.getElementById("bin-output-text").value = result;
}
function fibSequence()
{
    var fibTerm = 
    document.getElementById("std-input-text").value;
    document.getElementById("std-output-paragraph").innerHTML = "";
    var text = "";
    for (var i = 1; i <= fibTerm; i++)
    {
        text += calculateFib(i) + " ";
    }
    var speed = 75;
    var i = 0;
    var breakPoint = 45;
    function typeWriter()
    {
        if (i < text.length)
        {
            document.getElementById("std-output-paragraph").innerHTML += text.charAt(i);
            i++;
            if (i % breakPoint == 0)
            {
                document.getElementById("std-output-paragraph").innerHTML += "<br>";
                if (speed >= 30) speed -= 15;
            }
            setTimeout(typeWriter, speed);
        }
    }
    typeWriter();
}
function calculateFib(n, prevValues = [])
{
    if (prevValues[n] != null)
    {
        return prevValues[n];
    }
    var result;
    if (n <= 2)
    {
        result = 1;
    }
    else
    {
        result = calculateFib(n - 1, prevValues) + calculateFib (n - 2, prevValues);
    }
    prevValues[n] = result;
    return result;
}
