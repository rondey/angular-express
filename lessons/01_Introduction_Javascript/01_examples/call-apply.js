// a string is an array like type
var a = "esempio";
var c1 = a[0];
c1;

// but is does not have the forEach function
a.forEach();

// an array type has the forEach method
var arr = [0,1,2,3,4];
arr.forEach(function(number){
    console.log(number);
});

// using the apply function it is possible to call a function and set what is the "this"
var a = "esempio";
Array.prototype.forEach.apply(a, [function(number){console.log(number);}]);

// using the call function it is possible to call a function and set what is the "this"
var a = "esempio";
Array.prototype.forEach.call(a, function(number){console.log(number);});    

// define a function that use the this statement
var pippo = function () {
    console.log(this);
}
var pluto = "pluto";

// using the bind it is possible to create a clone of the function and call it with a defined this
var paperino = pippo.bind(pluto);
paperino();
