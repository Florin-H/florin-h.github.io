// CONSTANTS

const LocalStorageSupport = IsLocalStorageSupported();
const ls = window.localStorage;
const LocalStorageNotSupported = "Your browser does not support saving to local storage...";

const NAME = "name";
const CNP = "cnp";
const POB = "pob";
const FATHER = "father";

const CONSTANTS_NAMES = [NAME, CNP, POB, FATHER];

const CharacterType = 
{
  SYMBOL: 0,
  DIGIT: 1,
  CAPITAL: 2,
  NORMAL: 3
};
Object.freeze(CharacterType);

// LOCAL STORAGE & INIT

function IsLocalStorageSupported()
{
  if (typeof (Storage) !== "undefined")
  {
    return true;
  }
  else
  {
    return false;
  }
}

function LoadLocalStorage()
{
  if (LocalStorageSupport == false)
  {
    UpdateValidationResult(LocalStorageNotSupported);
    DisableTheOtherFunctions();
    return;
  }

  Initialize();
}

function DisableTheOtherFunctions()
{
  document.getElementById("purge-button").disabled = true;
  document.getElementById("save-button").disabled = true;
  document.getElementById("generate-button").disabled = true;
}

function Initialize()
{
  CONSTANTS_NAMES.forEach(element =>
    ls.getItem(element) ?
      document.getElementById(element).value = ls.getItem(element) :
      document.getElementById(element).removeAttribute("readonly")
  );

  document.getElementById("product").value = null;
  document.getElementById("chars-to-ignore").value = null;
  document.getElementById("iterations").value = null;
  document.getElementById("password").value = null;

  document.getElementById("chars-to-ignore").removeAttribute("readonly");
}

// VALIDATION

function UpdateValidationResult(message = "Validation failed.")
{
  document.getElementById("validation-result").innerHTML = message;
}

function Validate()
{
  return !ls.getItem(NAME) || !ls.getItem(CNP) || !ls.getItem(POB) || !ls.getItem(FATHER);
}

function EmptyValuesExist(fieldsToCheck = [])
{
  for (var i = 0; i < fieldsToCheck.length; i++)
  {
    if (!document.getElementById(fieldsToCheck[i]).value)
    {
      return true;
    }
  }

  return false;
}

// HELPERS

function FlattenProductName(product)
{
  return product.replace(/_/g, '').replace(/ /g, "_").replace(/[^a-z0-9_]+/gi, '').toLowerCase();
}

function SetExclusions(existingExclusions, exclusionsIterationStart, iterations)
{
  exclusionsInput = document.getElementById("chars-to-ignore");
  if (iterations < exclusionsIterationStart)
  {
    exclusionsInput.value = "NO EXCLUSIONS ALLOWED";
    exclusionsInput.setAttribute("readonly", "true");
    return true;
  }
  if (existingExclusions)
  {
    exclusionsInput.value = existingExclusions;
    exclusionsInput.setAttribute("readonly", "true");
    return true;
  }

  UpdateValidationResult("No exclusions set for this product!");
  if (exclusionsInput.getAttribute("readonly"))
  {
    exclusionsInput.value = "";
    exclusionsInput.removeAttribute("readonly");
  }
  return false;
}

function SaveExclusions(product, iterations, exclusionsInput)
{
    ls.setItem(product + "_exclusions", exclusionsInput.value);
    ls.setItem(product + "_exclusions_start", iterations);
    exclusionsInput.setAttribute("readonly", "true");
}

function LoadExistingIterations(product = "")
{
  if (EmptyValuesExist(['product']))
  {
    UpdateValidationResult("Product must NOT be empty");
    return;
  }

  if (!product)
  {
    product = FlattenProductName(document.getElementById("product").value);
  }
  var existingIterations = ls.getItem(product + "_iterations");
  if (!existingIterations)
  {
    existingIterations = IncreaseIterationsAndSave(product, 0);
  }
  document.getElementById("iterations").value = existingIterations;
  return existingIterations;
}

function IncreaseIterationsAndSave(product, iterations)
{
  ls.setItem(product + "_iterations", Number(iterations) + 1);
  return ls.getItem(product + "_iterations");
}

function EnableGenerateNewPassword()
{
  document.getElementById("generate-new-button").disabled = false;
}

function ExcludeSymbols(exclusions = [])
{
  var symbols = ['!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~'];
  var filteredSymbols = symbols.filter(function (value)
  {
    return !exclusions.includes(value);
  });
  return filteredSymbols;
}

// BUTTONS

function SaveConstants()
{
  if (EmptyValuesExist(CONSTANTS_NAMES) == true)
  {
    UpdateValidationResult("All constants must be filled in!");
    return;
  }

  CONSTANTS_NAMES.forEach(function (element)
  {
    ls.setItem(element, document.getElementById(element).value)
    document.getElementById(element).setAttribute("readonly", "true");
  });
}

function DeleteConstants()
{
  ls.clear();

  CONSTANTS_NAMES.forEach(function (element)
  {
    document.getElementById(element).value = "";
    document.getElementById(element).removeAttribute("readonly");
  });
}

function ShowHideToggle(buttonId, inputId)
{
  var target = document.getElementById(inputId);
  var buttonText = document.getElementById(buttonId);
  target.type === "password" ? target.type = "text" : target.type = "password";
  buttonText.innerHTML === "View" ? buttonText.innerHTML = "Hide" : buttonText.innerHTML = "View";
}

function GeneratePassword()
{
  if(Validate())
  {
    UpdateValidationResult("All constants must be filled and saved!");
    return;
  }

  if (EmptyValuesExist(['product']))
  {
    UpdateValidationResult("Product must NOT be empty");
    return;
  }

  var product = FlattenProductName(document.getElementById("product").value);
  
  var exclusionsInput = document.getElementById("chars-to-ignore");
  var iterations = LoadExistingIterations(product);
  var previousExclusionsExist = LoadExistingExclusions(product, iterations);

  if (!previousExclusionsExist && exclusionsInput.value)
  {
    SaveExclusions(product, iterations, exclusionsInput);
  }

  var symbolsTable = BuildShuffledSymbols(exclusionsInput.value, iterations);
  var digitsTable = BuildShuffledDigits(iterations);
  var capitalsTable = BuildShuffledCapitals(iterations);
  var normalsTable = BuildShuffledNormals(iterations);

  var realProduct = document.getElementById("product").value;
  pwd = BuildPassword(realProduct, 16, symbolsTable, digitsTable, capitalsTable, normalsTable);

  while (iterations != 1)
  {
    pwd = BuildPassword(pwd, 16, symbolsTable, digitsTable, capitalsTable, normalsTable);
    iterations--;
  }

  document.getElementById("password").value = pwd;

  EnableGenerateNewPassword();
  CopyPassword();
  document.getElementById("save-password").disabled = false;
}

function GenerateNewPassword()
{
  var product = FlattenProductName(document.getElementById("product").value);
  var iterations = LoadExistingIterations(product);
  IncreaseIterationsAndSave(product, iterations);
  GeneratePassword();
}

function LoadExistingExclusions(product = "", iterations)
{
  if (EmptyValuesExist(['product']))
  {
    UpdateValidationResult("Product must NOT be empty");
    return;
  }

  if (!product)
  {
    product = FlattenProductName(document.getElementById("product").value);
  }
  var existingExclusions = ls.getItem(product + "_exclusions");
  var exclusionsIterationStart = ls.getItem(product + "_exclusions_start");
  return SetExclusions(existingExclusions, exclusionsIterationStart, iterations);
}

function CopyPassword()
{
  document.getElementById("password").select();
  document.execCommand("copy");
}

// SAVING

function SavePassword()
{
  var data = GetData();
  Download("ABPG_MyInfo.json", data);
}

function GetData()
{
  var result = {};

  local = localStorage;
  for(var key in local)
  {
    result[key] = local[key];
  }

  return result;
}

function Download(filename, data) {
  var element = document.createElement('a');
  var text = JSON.stringify(data);
  element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// ALGORITHM

function BuildPassword(product, pwdLength, symbolsTable, digitsTable, capitalsTable, normalsTable)
{
  var shuffledProduct = Shuffle(product.split(""), GetArrayOfRandoms(product, product.length));
  var randomNumbers = GetArrayOfRandoms(shuffledProduct, pwdLength);
  
  var characterTypes = GetSequenceForCharacterTypes(shuffledProduct, symbolsTable, digitsTable, capitalsTable, pwdLength, 3);
  var result = [];

  for (var i = 0; i < characterTypes.length; i++)
  {
    switch(characterTypes[i])
    {
      case CharacterType.SYMBOL:
        result += symbolsTable[GetRandomNumber(randomNumbers[i], symbolsTable.length)];
        break;
      case CharacterType.DIGIT:
        result += digitsTable[GetRandomNumber(randomNumbers[i], digitsTable.length)];
        break;
      case CharacterType.CAPITAL:
        result += capitalsTable[GetRandomNumber(randomNumbers[i], capitalsTable.length)];
        break;
      case CharacterType.NORMAL:
        result += normalsTable[GetRandomNumber(randomNumbers[i], normalsTable.length)];
        break;
    }
  }
  return result;
}

function GetSequenceForCharacterTypes(shuffledProduct, symbolsTable, digitsTable, capitalsTable, pwdLength, maxNumber)
{
  var numberOfSymbols = GetRandomNumber(symbolsTable[0], maxNumber) + 2;
  var numberOfDigits = GetRandomNumber(digitsTable[0], maxNumber) + 2;
  var numberOfCapitals = GetRandomNumber(capitalsTable[0], maxNumber) + 2;
  var numberOfNormals = pwdLength - numberOfSymbols - numberOfDigits - numberOfCapitals;

  var symbolsArray = new Array(numberOfSymbols).fill(CharacterType.SYMBOL);
  var digitsArray = new Array(numberOfDigits).fill(CharacterType.DIGIT);
  var capitalsArray = new Array(numberOfCapitals).fill(CharacterType.CAPITAL);
  var normalsArray = new Array(numberOfNormals).fill(CharacterType.NORMAL);

  var result = symbolsArray.concat(digitsArray.concat(capitalsArray.concat(normalsArray)));
  var randoms = GetArrayOfRandoms(shuffledProduct, pwdLength);
  result = Shuffle(result, randoms);

  return result;
}

function BuildShuffledSymbols(exclusions = [], iterations)
{
  var filteredSymbols = ExcludeSymbols(exclusions);
  var pobValue = ls.getItem(POB).split("");
  var allOtherValues = (ls.getItem(FATHER) + ls.getItem(NAME) + ls.getItem(CNP)).split("");
  allOtherValues = GetArrayOfRandoms(allOtherValues, filteredSymbols.length);
  var randoms = null;
  var result = filteredSymbols;

  while (iterations != 0)
  {
    randoms = GetArrayOfRandoms(pobValue, result.length);
    randoms = Shuffle(randoms, allOtherValues);
    pobValue = randoms;
    result = Shuffle(result, randoms);
    
    iterations--;
  }
  return result;
}

function BuildShuffledDigits(iterations)
{
  var digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  var fatherValue = ls.getItem(FATHER);
  var allOtherValues = (ls.getItem(POB) + ls.getItem(NAME) + ls.getItem(CNP)).split("");
  allOtherValues = GetArrayOfRandoms(allOtherValues, digits.length);
  var randoms = null;
  var result = digits;

  while (iterations != 0)
  {
    randoms = GetArrayOfRandoms(fatherValue, result.length);
    randoms = Shuffle(randoms, allOtherValues);
    fatherValue = randoms;
    result = Shuffle(result, randoms);
    
    iterations--;
  }
  return result;
}

function BuildShuffledCapitals(iterations)
{
  var capitals = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  var nameValue = ls.getItem(NAME);
  var allOtherValues = (ls.getItem(FATHER) + ls.getItem(POB) + ls.getItem(CNP)).split("");
  allOtherValues = GetArrayOfRandoms(allOtherValues, capitals.length);
  var randoms = null;
  var result = capitals;

  while (iterations != 0)
  {
    randoms = GetArrayOfRandoms(nameValue, result.length);
    randoms = Shuffle(randoms, allOtherValues);
    nameValue = randoms;
    result = Shuffle(result, randoms);
    
    iterations--;
  }
  return result;
}

function BuildShuffledNormals(iterations)
{
  var normals = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  var cnpValue = ls.getItem(CNP);
  var allOtherValues = (ls.getItem(FATHER) + ls.getItem(POB) + ls.getItem(NAME)).split("");
  allOtherValues = GetArrayOfRandoms(allOtherValues, normals.length);
  var randoms = null;
  var result = normals;

  while (iterations != 0)
  {
    randoms = GetArrayOfRandoms(cnpValue, result.length);
    randoms = Shuffle(randoms, allOtherValues);
    cnpValue = randoms;
    result = Shuffle(result, randoms);
    
    iterations--;
  }
  return result;
}

// RANDOM

function GetRandomNumber(input, floor = 0)
{
  Math.seedrandom(input);
  if (floor == 0)
  {
    return Math.random();
  }
  else
  {
    return Math.floor(Math.random() * Math.floor(floor))
  }
}

function GetArrayOfRandoms(input = [], maxLength, floor = 0)
{
  var result = [];

  for (var i = 0; i < input.length; i++)
  {
    result[i] = GetRandomNumber(input[i], floor);
  }
  for (var i = input.length; i < maxLength; i++)
  {
    result[i] = GetRandomNumber(result[i - input.length], floor);
  }

  return result;
}

function Shuffle(inputArray = [], randoms = [])
{
  var j, x, i, k = 0;
  for (i = inputArray.length - 1; i > 0; i--)
  {
    j = Math.floor(randoms[k] * (i + 1));
    x = inputArray[i];
    inputArray[i] = inputArray[j];
    inputArray[j] = x;
    k++;
  }
  return inputArray;
}

// DEBUG

function TestMyCode(input)
{
  
  // var node = document.getElementById("dvTable");
  // for (var i = 1; i < 101; i++)
  // {
  //   var textNode = document.createTextNode(GetRandomNumber(i, 2));
  //   node.appendChild(textNode)
  //   node.innerHTML = node.innerHTML + "<br/>";
  // }
}

// RANDOM GENERATOR
/**

seedrandom.js
=============

Seeded random number generator for Javascript.

version 2.3.10
Author: David Bau
Date: 2014 Sep 20

LICENSE (MIT)
-------------

Copyright 2014 David Bau.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/**
 * All code is in an anonymous closure to keep the global namespace clean.
 */
(function (
  global, pool, math, width, chunks, digits, module, define, rngname)
{

  //
  // The following constants are related to IEEE 754 limits.
  //
  var startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1,
    nodecrypto;

  //
  // seedrandom()
  // This is the seedrandom function described above.
  //
  var impl = math['seed' + rngname] = function (seed, options, callback)
  {
    var key = [];
    options = (options == true) ? { entropy: true } : (options || {});

    // Flatten the seed string or build one from local entropy if needed.
    var shortseed = mixkey(flatten(
      options.entropy ? [seed, tostring(pool)] :
        (seed == null) ? autoseed() : seed, 3), key);

    // Use the seed to initialize an ARC4 generator.
    var arc4 = new ARC4(key);

    // Mix the randomness into accumulated entropy.
    mixkey(tostring(arc4.S), pool);

    // Calling convention: what to return as a function of prng, seed, is_math.
    return (options.pass || callback ||
      // If called as a method of Math (Math.seedrandom()), mutate Math.random
      // because that is how seedrandom.js has worked since v1.0.  Otherwise,
      // it is a newer calling convention, so return the prng directly.
      function (prng, seed, is_math_call)
      {
        if (is_math_call) { math[rngname] = prng; return seed; }
        else return prng;
      })(

        // This function returns a random double in [0, 1) that contains
        // randomness in every bit of the mantissa of the IEEE 754 value.
        function ()
        {
          var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
            d = startdenom,                 //   and denominator d = 2 ^ 48.
            x = 0;                          //   and no 'extra last byte'.
          while (n < significance)
          {          // Fill up all significant digits by
            n = (n + x) * width;              //   shifting numerator and
            d *= width;                       //   denominator and generating a
            x = arc4.g(1);                    //   new least-significant-byte.
          }
          while (n >= overflow)
          {             // To avoid rounding up, before adding
            n /= 2;                           //   last byte, shift everything
            d /= 2;                           //   right using integer math until
            x >>>= 1;                         //   we have exactly the desired bits.
          }
          return (n + x) / d;                 // Form the number within [0, 1).
        }, shortseed, 'global' in options ? options.global : (this == math));
  };

  //
  // ARC4
  //
  // An ARC4 implementation.  The constructor takes a key in the form of
  // an array of at most (width) integers that should be 0 <= x < (width).
  //
  // The g(count) method returns a pseudorandom integer that concatenates
  // the next (count) outputs from ARC4.  Its return value is a number x
  // that is in the range 0 <= x < (width ^ count).
  //
  /** @constructor */
  function ARC4(key)
  {
    var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

    // The empty key [] is treated as [0].
    if (!keylen) { key = [keylen++]; }

    // Set up S using the standard key scheduling algorithm.
    while (i < width)
    {
      s[i] = i++;
    }
    for (i = 0; i < width; i++)
    {
      s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
      s[j] = t;
    }

    // The "g" method returns the next (count) outputs as one number.
    (me.g = function (count)
    {
      // Using instance members instead of closure state nearly doubles speed.
      var t, r = 0,
        i = me.i, j = me.j, s = me.S;
      while (count--)
      {
        t = s[i = mask & (i + 1)];
        r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
      }
      me.i = i; me.j = j;
      return r;
      // For robust unpredictability, the function call below automatically
      // discards an initial batch of values.  This is called RC4-drop[256].
      // See http://google.com/search?q=rsa+fluhrer+response&btnI
    })(width);
  }

  //
  // flatten()
  // Converts an object tree to nested arrays of strings.
  //
  function flatten(obj, depth)
  {
    var result = [], typ = (typeof obj), prop;
    if (depth && typ == 'object')
    {
      for (prop in obj)
      {
        try { result.push(flatten(obj[prop], depth - 1)); } catch (e) { }
      }
    }
    return (result.length ? result : typ == 'string' ? obj : obj + '\0');
  }

  //
  // mixkey()
  // Mixes a string seed into a key that is an array of integers, and
  // returns a shortened string seed that is equivalent to the result key.
  //
  function mixkey(seed, key)
  {
    var stringseed = seed + '', smear, j = 0;
    while (j < stringseed.length)
    {
      key[mask & j] =
        mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
    }
    return tostring(key);
  }

  //
  // autoseed()
  // Returns an object for autoseeding, using window.crypto if available.
  //
  /** @param {Uint8Array|Navigator=} seed */
  function autoseed(seed)
  {
    try
    {
      if (nodecrypto) return tostring(nodecrypto.randomBytes(width));
      global.crypto.getRandomValues(seed = new Uint8Array(width));
      return tostring(seed);
    } catch (e)
    {
      return [+new Date, global, (seed = global.navigator) && seed.plugins,
      global.screen, tostring(pool)];
    }
  }

  //
  // tostring()
  // Converts an array of charcodes to a string
  //
  function tostring(a)
  {
    return String.fromCharCode.apply(0, a);
  }

  //
  // When seedrandom.js is loaded, we immediately mix a few bits
  // from the built-in RNG into the entropy pool.  Because we do
  // not want to interfere with deterministic PRNG state later,
  // seedrandom will not call math.random on its own again after
  // initialization.
  //
  mixkey(math[rngname](), pool);

  //
  // Nodejs and AMD support: export the implementation as a module using
  // either convention.
  //
  if (module && module.exports)
  {
    module.exports = impl;
    try
    {
      // When in node.js, try using crypto package for autoseeding.
      nodecrypto = require('crypto');
    } catch (ex) { }
  } else if (define && define.amd)
  {
    define(function () { return impl; });
  }

  //
  // Node.js native crypto support.
  //

  // End anonymous scope, and pass initial values.
})(
  this,   // global window object
  [],     // pool: entropy pool starts empty
  Math,   // math: package containing random, pow, and seedrandom
  256,    // width: each RC4 output is 0 <= x < 256
  6,      // chunks: at least six RC4 outputs for each double
  52,     // digits: there are 52 significant digits in a double
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define,  // present with an AMD loader
  'random'// rngname: name for Math.random and Math.seedrandom
);