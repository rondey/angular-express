export const first = function () {

    function sayHello(person:any) {
        return "Hello, " + person;
    }

    let person = "Jon Snow";
    console.log(sayHello(person));

    let array = [0, 1, 2, 3, 4];
    console.log(sayHello(array));
}