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
    randomdirection(){
        `Inputs: None
         Outputs: None
         Makes the vector a unit vector pointing in a random direction
        `
        let theta = Math.random()*(2*Math.PI)
        this.x = Math.cos(theta)
        this.y = Math.sin(theta)
    }
    random(){
        this.x = Math.random()
        this.y = Math.random()
    }
    scale(L){
        this.x = this.x*L
        this.y = this.y*L
    }
    add(vect){
        this.x += vect.x
        this.y += vect.y
    }
}


class Boid {
    constructor(){
        this.position = new Vector2()
        this.velocity = new Vector2()
        this.position.random()
        this.velocity.randomdirection()
        this.velocity.scale(.05)
    }
    step(){
        this.position.add(this.velocity)
    }
    draw(){
        let canvas = document.getElementById('canvas')
        var x = this.position.x*canvas.width
        var y = this.position.y*canvas.height
        var dx = (this.position.x + this.velocity.x)*canvas.width
        var dy = (this.position.y + this.velocity.y)*canvas.height
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(x,y,10,0,2*Math.PI);
        ctx.moveTo(x,y)
        ctx.lineTo(dx,dy);
        ctx.stroke();        
    }
}

function GenerateBoids(count) {
    var boids = []
    for (var i = 0; i < count; i++) {
        boids.push(new Boid())
    }
    return boids
}

boids = GenerateBoids(100)

window.addEventListener('click', function() {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < boids.length; i++) {
        boids[i].step()
        boids[i].draw()
    }
    setTimeout(2000);
})
