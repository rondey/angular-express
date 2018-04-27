console.log(0 == '');
// output: true

console.log(0 == '0');
// output: true

console.log('' == '0');
// output: false

console.log(false == 'false');
// output: false

console.log(false == '0');
// output: true

console.log(false == undefined);
// output: false

console.log(false == null);
// output: false

console.log(null == undefined);
// output: true

console.log(' \t\r\n ' == 0);
// output: true

console.log("abc" == new String("abc"));
// output: true

console.log("abc" === new String("abc"));
// output: false

console.log(0.1 + 0.2 == 0.3);
// output: false
// sum of float values is not equeals obvious float value

console.log(NaN != NaN);
// output: true

console.log(NaN == NaN);
// output: false

console.log(NaN === NaN);
// output: false

console.log(!!undefined);
// output: false

console.log(!!NaN);
// output: false

console.log(!!null);
// output: false

console.log([1, 2, 3] == [1, 2, 3]);
// output: false
// How to detect array equality in JavaScript?

console.log(new Array(3) == ",,");
// output: true

console.log(new Array(3) === ",,");
// output: false

console.log("a" > "b");
// output: false

console.log("abcd" < "abcd");
// output: false

console.log("abcd" < "abdc");
// output: true