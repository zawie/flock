class Vector2 {
    constructor (x = 0,y = 0) {
        `Inputs: Two integers: x,y that will be the constructs of the vector
         Outputs: None
         Returns a unit vector with the same direction as the called vector`
        this.x = x
        this.y = y
    }
    magnitude(){
        `Inputs: None
         Outputs: A floating point number
         Returns the length of the vector object`
        return Math.pow(Math.pow(this.x,2) + Math.pow(this.y,2),1/2)
    }
    unit(){
        `Inputs: None
         Outputs: A floating point number
         Returns a unit vector with the same direction as the called vector`
        let size = this.magnitude()
        return new Vector2(this.x/size,this.y/size)
    }
    angle(){
        `Inputs: None
         Outputs: A floating point number
         Returns the radian angles from x-axis`
        if (this.magnitude() > 0) {
            return Math.acos(this.x/this.magnitude())
        } else {
            return 0
        }
    }
    random(){
        `Inputs: None
         Outputs: None
         Makes the vector a unit vector pointing in a random direction
        `
        let theta = Math.random()*(2*Math.PI)
        this.x = Math.cos(theta)
        this.y = Math.sin(theta)
    }
}


class Boid {
    constructor(){
        this.position = new Vector2()
        this.velocity = new Vector2()
        this.position.random()
        this.velocity.random()
    }
    step(){
        
    }
}

function GenerateBoids(count) {
    var boids = []
    for (var i = 0; i < count; i++) {
        boids.push(new Boid())
    }
}

boids = GenerateBoids(10)

for (var i = 0; i < 1000; i++) {
    boids.forEach((boid)=>boid.step())
    boids.forEach((boid)=>boid.draw())
}
