class Vector2 {
    constructor (x,y) {
        `
        Inputs: Two integers: x,y that will be the constructs of the vector
        Outputs: None
        Returns a unit vector with the same direction as the called vector
        `
        this.x = x
        this.y = y
    }
    magnitude(){
        `
        Inputs: None
        Outputs: A floating point number
        Returns the length of the vector object
        `
        return Math.pow(Math.pow(this.x,2) + Math.pow(this.y,2),1/2)
    }
    unit(){
        `
        Inputs: None
        Outputs: A floating point number
        Returns a unit vector with the same direction as the called vector
        `
        let size = this.magnitude()
        return new Vector2(this.x/size,this.y/size)
    }
    angle(){
        `
        Inputs: None
        Outputs: A floating point number
        Returns the radian angles from origin
        `
        return Math.acos(this.x/this.magnitude())
    }
}

pos = new Vector2(1,2)
console.log(pos.angle())