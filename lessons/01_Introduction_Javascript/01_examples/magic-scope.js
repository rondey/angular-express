function Foo(value) {
    this.bar = value;
}
var test = new Foo('test');
console.log(test.bar);
// output: test

Foo('test');
console.log(bar);
// output: test
