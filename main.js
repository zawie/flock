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
        if (size > 0) {
            return this.scale(1/this.magnitude())
        } else {
            return this
        }
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

    average(vect){
        return this.add(vect).scale(1/2)
    }

    random(){
        this.x = Math.random()
        this.y = Math.random()
    }
    scale(L){
        return new Vector2(this.x*L,this.y*L)
    }
    inverse(){
        return this.scale(-1)
    }
    add(vect){
        return new Vector2(this.x + vect.x, this.y + vect.y)
    }
    sub(vect){
        return new Vector2(this.x - vect.x, this.y - vect.y)
    }
    clone(){
        return new Vector2(this.x,this.y)
    }
}

class Boid {
    constructor(isMarked = false){
        this.marked = isMarked
        //
        this.radius = .05
        //
        this.position = new Vector2()
        this.direction = new Vector2()
        this.speed = .0015
        this.position.random()
        this.direction.randomdirection()
    }
    getVisible(boids){
        var nearby = new Array();
        boids.forEach(boid => {
            if (boid != this) {
                const distance = boid.position.sub(this.position).magnitude()
                if (distance < this.radius ) {
                    nearby.push(boid)
                }
            }
        })
        return nearby
    }
    step(){
        var velocity = this.direction.scale(this.speed)
        this.position = this.position.add(velocity)
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
        var dx = (this.position.x + this.direction.x*10*this.speed)*canvas.width
        var dy = (this.position.y + this.direction.y*10*this.speed)*canvas.height
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
        //Seperation
        var totalDelta = new Vector2(0,0)
        nearby.forEach(boid => {
            const diff = this.position.sub(boid.position);
            const delta = diff.scale(1/diff.magnitude())
            totalDelta = totalDelta.add(delta)

        })
        var seperationDelta = this.direction.add(totalDelta.unit()).unit()
        // Allignment
        var allignmentDelta = new Vector2()
        if (nearby.length > 0) {
            var total_angle = 0
            nearby.forEach(boid => {
                total_angle += boid.direction.angle()
            })
            const theta = total_angle/nearby.length
            var allignmentDelta = new Vector2 (Math.sin(theta),Math.cos(theta))
        }
        // Cohesion
        var cohesionDelta = new Vector2()
        if (nearby.length > 0) {
            var total_position = new Vector2()
            nearby.forEach(boid => {
                total_position = total_position.add(boid.position)
            })
            const average_position = total_position.scale(1/nearby.length)
            var cohesionDelta = this.position.sub(average_position).unit()
        }
        // Change direction
        const desiredDelta = cohesionDelta.add(seperationDelta).add(allignmentDelta).unit()
        this.direction = this.direction.average(desiredDelta)
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

var current_interval = NaN
function play() {
    current_interval = window.setInterval(() => {
        animate(boids)
    }, 10);    
}
function toggle() {
    if (current_interval) {
        window.clearInterval(current_interval)
        current_interval = NaN
    } else {
        current_interval = window.setInterval(() => {
            animate(boids)
        }, 10);  
    }
}
boids = GenerateBoids(100)
play()

var playing = true
window.addEventListener("click", toggle);
