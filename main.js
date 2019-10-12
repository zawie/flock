class Vector2 {
    constructor (x = 0,y = 0) {
        `Inputs: Two numbers, x,y
         Creates a vector <x,y>`
        this.x = x
        this.y = y
    }
    magnitude(){
        `Outputs: A floating point number 
         Returns the length of the vector`
        return Math.pow(Math.pow(this.x,2) + Math.pow(this.y,2),1/2)
    }
    unit(){
        `Output: A vector object
        Returns a unit vector with the same direction as the called vector`
        let size = this.magnitude()
        if (size > 0) {
            return this.scale(1/this.magnitude())
        } else {
            return this
        }
    }
    dot(vect){
        `Input: A vector
         Output: A floating point number
         Returns the dot product between the inputed vector`
        return this.x*vect.x + this.y*vect.y
    }
    angle(vect){
        `Inputs: A vector
         Outputs: A floating point number
         Returns the angular difference between the inputted vactor`
        if (vect) {
            const numerator = this.dot(vect)
            const denominator = this.magnitude()*vect.magnitude()
            if (denominator == 0) {
                return 0
            } else {
                return Math.acos(numerator/denominator)
            }
        } else {
            return Math.acos(this.unit().x)
        }
    }
    average(vect){
        `Inputs: A vector
         Outputs: A vector
         Returns the average vector between this and input`
        return this.add(vect).scale(1/2)
    }
    scale(L){
        `Inputs: A floating point number
         Outputs: A vector
         Returns a vector in the same direction but scaled by L`
        return new Vector2(this.x*L,this.y*L)
    }
    inverse(){
        `Outputs: A vector
         Returns an identical vector in the opposite direction`
        return this.scale(-1)
    }
    add(vect){
        `Inputs: A vector
         Outputs: A vector
         Returns the addition of two vectors`
        return new Vector2(this.x + vect.x, this.y + vect.y)
    }
    sub(vect){
        `Inputs: A vector
         Outputs: A vector
         Returns the difference of two vectors`
        return new Vector2(this.x - vect.x, this.y - vect.y)
    }
    clone(){
        `Returns a copy of the vector object`
        return new Vector2(this.x,this.y)
    }
    random(){
        `Randomly assigns the x and y coordinates a number between 0 and 1`
        this.x = Math.random()
        this.y = Math.random()
    }
    randomdirection(){
        `Makes the vector a unit vector pointing in a random direction`
        let theta = Math.random()*(2*Math.PI)
        this.x = Math.cos(theta)
        this.y = Math.sin(theta)
    }
}

class Enviornment {
    constructor(canvas,wrapAround = false) {
        this.population = new Array();
        this.canvas = canvas
    }
    addRectangle(){

    }
    addCircle(){

    }
    generateBoid(count = 1, pos = new Vector2(Math.random(),Math.random())){
        for (var i = 0; i < count; i++) {
            this.population.push(new Boid(pos, this, this.population.length == 0))
        }
    }
    step(){
        this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.population.forEach(boid => boid.heartbeat())
    }
    play(){
        this.current_interval = window.setInterval(() => {
            this.step()
        }, 10); 
    }
    pause(){
        window.stopInterval(this.current_interval)
    }
}
class Boid {
    constructor(pos = new Vector2(), enviornment, isMarked = false){
        this.marked = isMarked
        this.enviornment = enviornment
        //
        this.radius = .025
        this.fieldOfView = 0.8 * 2*Math.PI
        this.allignTendency = .5
        this.seperateTendency = .02
        this.coohesionTendency = .75
        //
        this.position = pos
        this.direction = new Vector2()
        this.speed = .001
        this.direction.randomdirection()
    }
    getVisible(boids){
        var nearby = new Array();
        boids.forEach(boid => {
            if (boid != this) {
                const delta = boid.position.sub(this.position)
                if (delta.magnitude() < this.radius ) {
                    var theta = delta.angle(this.velocity)
                    if (theta < this.fieldOfView/2) {
                        nearby.push(boid)
                    }
                }
            }
        })
        return nearby
    }
    step(){
        var noise = new Vector2()
        noise.randomdirection()
        this.direction = this.direction.add(noise.scale(.1)).unit()
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
        let canvas = this.enviornment.canvas
        var x = this.position.x*canvas.width
        var y = this.position.y*canvas.height
        var dx = (this.position.x + this.direction.x*this.speed*5)*canvas.width
        var dy = (this.position.y + this.direction.y*this.speed*5)*canvas.height
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
            ctx.beginPath();
            ctx.arc(x,y,this.radius*canvas.height,0,2*Math.PI);
            ctx.moveTo(x,y)
            ctx.lineTo(dx,dy);
            ctx.closePath();
            ctx.stroke();
        }
    }
    cohesion(nearby){
        // Cohesion
        var cohesionDelta = new Vector2()
        var total_position = new Vector2()
        nearby.forEach(boid => {
            total_position = total_position.add(boid.position)
        })
        const average_position = total_position.scale(1/nearby.length)
        var delta = average_position.sub(this.position).unit()
        this.direction = this.direction.add(delta.scale(this.coohesionTendency))
    }
    seperate(nearby){
        //Seperation
        var seperationDelta = new Vector2(0,0)
        nearby.forEach(boid => {
            const diff = this.position.sub(boid.position)
            const distance = diff.magnitude()/this.radius
            const delta = diff.unit().scale(this.seperateTendency/distance)
            seperationDelta = seperationDelta.add(delta)
        })
        this.direction = this.direction.add(seperationDelta.scale(1/nearby.length))
    }
    align(nearby) {
        // Allignment
        var total_angle = 0
        nearby.forEach(boid => {
            total_angle += boid.direction.angle()
        })
        const theta = total_angle/nearby.length
        let delta = new Vector2 (Math.sin(theta),Math.cos(theta))
        this.direction = this.direction.add(delta.scale(this.allignTendency))
    }
    heartbeat(){
        const nearby = this.getVisible(this.enviornment.population)
        if (nearby.length > 0) {
            this.align(nearby)
            this.seperate(nearby)
        }
        this.step()
        this.draw()      
    }
}

let canvas = document.getElementById('canvas')
let system = new Enviornment(canvas, true)
system.generateBoid(100)
system.play()

//Mouse Stuff
function elePos(ele) { // jcgregorio
    var dx = ele.offsetLeft;
    var dy = ele.offsetTop;
    while (ele.offsetParent) {
      ele = ele.offsetParent;
      dx += ele.offsetLeft;
      dy += ele.offsetTop;
    }
    return new Vector2(dx,dy)
  }
function onClick(event) {
    const pos = elePos(canvas)
    const click = new Vector2(event.clientX,event.clientY)
    const canvasPos = click.sub(pos)
    const relativePos = canvasPos.scale(1/canvas.width)
    system.generateBoid(5,relativePos)
  }
  
  document.addEventListener("click", onClick);