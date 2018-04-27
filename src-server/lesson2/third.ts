export class GotCharacter {
    // Our properties:
    // By default they are public, but can also be private or protected.
    firstName: string;
    house: string;
    aka: string;
    isDead: boolean;

    // A straightforward constructor. 
    constructor(firstName: string, house: string, aka: string, isDead: boolean) {
        // The this keyword is mandatory.
        this.firstName = firstName;
        this.house = house;
        this.aka = aka;
        this.isDead = isDead;
    }

    // Methods
    fullName(): string
    {
        return this.firstName + " " + this.house + " " + (this.aka ? "aka " : "") + this.aka + " (" + (this.isDead ? "Dead" : "Alive") + ")";
    }

}

// Create a new instance of GotCharacter.
var varis = new GotCharacter("Varis", "", "Spider", false);
// Call the list method.
console.log(varis.fullName());


export class Stark extends GotCharacter {
    // A straightforward constructor. 
    constructor(firstName: string, aka: string, direwolfName: string, isDead: boolean) {
        super(firstName, "Stark", aka, isDead);
        this.direwolfName = direwolfName;
    }

    direwolfName: string;

    // Methods
    fullName(): string
    {
        return super.fullName() + (this.direwolfName ? ", direwolf " + this.direwolfName : "");
    }
    
}

// Create a new instance of the HappyMeal class.
var eddard = new Stark("Eddard", "Lord Regent of the Seven Kingdoms", null, true);
console.log(eddard.fullName());

var robb = new Stark("Robb", "King in the North", "Grey Wind", true);
console.log(robb.fullName());