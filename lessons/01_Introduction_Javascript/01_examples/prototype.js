// define a new function
function Animal(name)
{
    this.name = name;
    this.getName = function(){
        return this.name;
    }
}

// create an object from the Animal definiton
var dog = new Animal("Pluto");
dog;

// call getname method
var name = dog.getName();
name;

// changing get name definition
Animal.getName = function(){
    return "My name is " + this.name;
}

// dog does not get the function change
name = dog.getName();
name;


// dog does not get the function change
Animal.prototype.getName = function(){
    return "My name is " + this.name;
}

// if you call directly the __proto__ method the scope is not related to dog and name is undefined
name = dog.__proto__.getName();
name;

// delete the getName method from the dog instance
delete dog.getName;

// now it uses the prototype function
name = dog.getName();
name;

