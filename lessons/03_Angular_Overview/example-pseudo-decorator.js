// Copy and Paste me in a new Pen: https://codepen.io/pen/

function superSaiyanDecorator(target) {
    target.power = target.power ? target.power + 9000 : 9000;
    var _getName = target.getName;
    target.getName = function () {
        return _getName() + ' and its power level is over ' + this.power;
    }
}

function human(name) {
    this.getName = function() {
        return 'This is '+name;
    }
}

var person = new human('vegeta');

console.log(person.getName());

superSaiyanDecorator(person);

console.log(person.getName());