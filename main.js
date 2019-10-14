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
    cross(that){
        return this.x*that.y + this.y*that.x
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
class Boid {
    constructor(pos = new Vector2(), enviornment, isMarked = false){
        this.marked = isMarked
        this.enviornment = enviornment
        //
        this.radius = .05
        this.fieldOfView = 0.8 * 2*Math.PI
        this.allignTendency = .4
        this.seperateTendency = .1
        this.coohesionTendency = .5
        this.chaosTendency = .1
        //
        this.position = pos
        this.velocity = new Vector2()
        this.velocity.randomdirection()
        this.maxSpeed = .001
        this.maxForce = .00001
        this.mass = 1
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
    draw(){
        let canvas = this.enviornment.canvas
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
            // fill dot blue
            ctx.fillStyle = "#3370d4"; //blue
            ctx.fill();
            // add radius bubble
            ctx.beginPath();
            ctx.arc(x,y,this.radius*canvas.height,0,2*Math.PI);
            ctx.moveTo(x,y)
            ctx.lineTo(dx,dy);
            ctx.closePath();
            ctx.stroke();
            // add force arrow
            var ax = (this.position.x + this.force.x*this.radius/this.maxForce)*canvas.width
            var ay = (this.position.y + this.force.y*this.radius/this.maxForce)*canvas.height
            ctx.beginPath();
            ctx.arc(x,y,5,0,2*Math.PI);
            ctx.moveTo(x,y)
            ctx.lineTo(ax,ay);
            ctx.closePath();
            ctx.stroke();
        }
    }
    cohesion(nearby){
        // Cohesion
        var total_position = new Vector2()
        nearby.forEach(boid => {
            total_position = total_position.add(boid.position)
        })
        const average_position = total_position.scale(1/nearby.length)
        if (this.marked){
            this.enviornment.highlight(average_position.x,average_position.y)
        }
        const force = average_position.sub(this.position)
        return force.unit()
    }
    seperate(objects){
        //Seperation
        var force = new Vector2()
        objects.forEach(object => {
            const diff = this.position.sub(object.position)
            const distance = diff.magnitude()/this.radius
            const delta = diff.unit().scale(.1/Math.pow(distance,2))
            force = force.add(delta)
        })
        return force
    }
    align(nearby) {
        // Allignment
        var total_velocity = new Vector2()
        nearby.forEach(boid => {
            total_velocity.add(boid.velocity)
        })
        const average_velocity = total_velocity.scale(1/nearby.length)
        const force = average_velocity.unit().scale(nearby.length)
        return force
    }
    noise(){
        const theta = this.velocity.angle()
        const randAngle = (Math.random()-.5)*Math.PI
        const phi = theta + randAngle
        const force = new Vector2(Math.cos(phi),Math.sin(phi)).scale(Math.random())
        return force
    }
    heartbeat(){
        const nearby = this.getVisible(this.enviornment.population)
        var netForce = this.noise()
        if (nearby.length > 0) {
            const steerAlign = this.align(nearby)
            const steerSeperate = this.seperate(nearby)
            const steerCohesion = this.cohesion(nearby)
            const forces = [steerAlign,steerCohesion,steerSeperate]
            for (let force of forces){
                netForce = netForce.add(force)
            }
            netForce.scale(1/(forces.length+1))
        }
        if (this.marked) {
            console.log(netForce)
        }
        this.force = netForce.scale(this.maxForce)
        this.velocity = this.velocity.add(this.force)
        if (this.velocity.magnitude() > this.maxSpeed) {
            this.velocity = this.velocity.unit().scale(this.maxSpeed)
        }
        this.position = this.position.add(this.velocity)
        this.draw()
    }
}


class Enviornment {
    constructor(canvas) {
        this.population = new Array();
        this.canvas = canvas
        this.playing = false
    }
    generateBoids(count = 1, pos = new Vector2(Math.random(),Math.random())){
        for (var i = 0; i < count; i++) {
            this.population.push(new Boid(pos, this, this.population.length == 0))
       }
    }
    populate(count){
        for (var i = 0; i < count; i++) {
            this.generateBoids(1)
        }  
    }
    step(){
        this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.population.forEach(boid => boid.heartbeat())
        this.population.forEach(boid=>{
            if (boid.position.y < 0){
                boid.position.y = 1
            } else if(boid.position.y > 1){
                boid.position.y = 0
            }
            if (boid.position.x < 0){
                boid.position.x = 1
            } else if(boid.position.x > 1){
                boid.position.x = 0
            }
        })
    }
    highlight(x,y){
        let canvas = this.canvas
        x = x*canvas.width
        y = y*canvas.height
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(x,y,5,0,2*Math.PI);
        ctx.closePath();
        ctx.fillStyle = "#ff0000"; //red
        ctx.fill()
    }
    play(){
        this.playing = true
        this.current_interval = window.setInterval(() => {
            this.step()
        }, 0.5); 
    }
    pause(){
        this.playing = false
        window.clearInterval(this.current_interval)
    }
    toggle(){
        if (this.playing) {
            this.pause()
        } else {
            this.play()
        }
    }
}

let canvas = document.getElementById('canvas')
let system = new Enviornment(canvas)
system.populate(100)
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
    system.generateBoids(5,relativePos)
  }
  
  document.addEventListener("click", onClick);
  document.body.onkeyup = function(e){
    if(e.keyCode == 32){
        system.toggle()
    }
}