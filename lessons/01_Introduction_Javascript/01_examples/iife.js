// CLOSURE EXAMPLE
var adder = function (y) {
    return function (x) {
        return x + y;
    }
}

addFive = adder(5);
seven = addFive(2);
seven;

//---------------------------------------------------------------------------------------
// wrong statement

var arr = [];
for (var i = 1; i <= 5; i++)
{
    var link = {};
    link.innerHTML = "Link " + i + " - ";
    link.onclick = function() {
        console.log(i);
    };
    arr.push(link);
}
arr.forEach(function(link){
    link.onclick();
    console.log(link.innerHTML);
});

function ciccio(params) {
    return params;
}

ciccio;
var c = ciccio("pippo");
c;
d = ciccio;
var e = d("pluto");
e;
var g = ciccio;
var t = (g)("gionni");
t;
var cinque = (3 + 2);
cinque

//---------------------------------------------------------
// using IIFE to fix the issue
var arr = [];
for (var i = 1; i <= 5; i++)
{
    var link = {};
    link.innerHTML = "Link " + i + " - ";
    link.onclick = (function(a) {
        return function(){
            console.log(a);
        }
    })(i);
    arr.push(link);
}
arr.forEach(function(link){link.onclick()});

