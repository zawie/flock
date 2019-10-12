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
        return new Vector2(this.x + vect.x, this.y + vect.y)
    }
    sub(vect){
        return new Vector2(this.x - vect.x, this.y - vect.y)
    }
}

class Boid {
    constructor(isMarked = false){
        this.marked = isMarked
        //
        this.radius = .1
        //
        this.position = new Vector2()
        this.velocity = new Vector2()
        this.position.random()
        this.velocity.randomdirection()
        this.velocity.scale(.001)
    }
    getVisible(boids){
        var nearby = new Array();
        boids.forEach(boid => {
            if (boid != this) {
                const distance = boid.position.sub(this.position).magnitude()
                if (this.marked && distance < this.radius ) {
                    nearby.push(boid)
                }
            }
        })
        return nearby
    }
    step(){
        this.position = this.position.add(this.velocity)
        //Wrap around
        if (this.position.y < 0){
            this.position.y = 1
        } else if(this.position.y > 1){
            this.position.y = 0
        }
        if (this.position.x < 0){
            this.position.x = 1
        } else if(this.position.x > 1){
            this.position.x = 0
        }
    }
    draw(){
        let canvas = document.getElementById('canvas')
        var x = this.position.x*canvas.width
        var y = this.position.y*canvas.height
        var dx = (this.position.x + this.velocity.x*10)*canvas.width
        var dy = (this.position.y + this.velocity.y*10)*canvas.height
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(x,y,5,0,2*Math.PI);
        ctx.moveTo(x,y)
        ctx.lineTo(dx,dy);
        ctx.closePath();
        ctx.stroke();
        if (this.marked) {
            ctx.fillStyle = "#3370d4"; //blue
            ctx.fill();
            // radius picture
            ctx.beginPath();
            ctx.arc(x,y,canvas.height*this.radius,0,2*Math.PI);
            ctx.moveTo(x,y)
            ctx.lineTo(dx,dy);
            ctx.closePath();
            ctx.stroke();
        }
    }
    steer(boids){
        const nearby = this.getVisible(boids)
        nearby.forEach(boid => {

        })
    }
    heartbeat(boids){
        this.steer(boids)
        this.step()
        this.draw()      
    }
}

function GenerateBoids(count) {
    var boids = []
    for (var i = 0; i < count; i++) {
        boids.push(new Boid(i==0))
    }
    return boids
}

function animate(boids) {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    boids.forEach(boid => boid.heartbeat(boids))
}

boids = GenerateBoids(10)
window.setInterval(() => {
    animate(boids)
}, 10);