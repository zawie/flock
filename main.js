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
    constructor(enviornment, pos = new Vector2(), isMarked = false){
        this.marked = isMarked
        this.enviornment = enviornment
        //
        this.radius = .05
        this.fieldOfView = 0.8 * 2*Math.PI
        this.allignTendency = .4
        this.seperateTendency = .1
        this.coohesionTendency = .5
        this.chaosTendency = .1
        this.size = 5
        this.rgbString = `rgb(
            ${Math.floor(Math.random()*80)+155},
            ${Math.floor(Math.random()*80)+155},
            ${Math.floor(Math.random()*80)+155})`
        //
        this.position = pos
        this.velocity = new Vector2()
        this.velocity.randomdirection()
        this.maxSpeed = .00075
        this.maxForce = .00001
        this.mass = 1
    }
    draw(){
        let canvas = this.enviornment.canvas
        var ctx = canvas.getContext("2d");
        const direction = this.velocity.unit()
        const center = this.position.scale(canvas.width)
        const heading = direction.angle()
        const phi = heading - 60*Math.PI/180
        const theta = heading + 60*Math.PI/180
        const r_leg = new Vector2(Math.cos(phi),Math.sin(phi))
        const l_leg = new Vector2(Math.cos(theta),Math.sin(theta))
        const left = center.add(l_leg.scale(this.size))
        const right = center.add(r_leg.scale(this.size))
        const point = center.add(direction.scale(3*this.size))
        ctx.beginPath()
        ctx.moveTo(point.x,point.y)
        ctx.lineTo(left.x,left.y)
        ctx.lineTo(right.x,right.y)
        ctx.closePath()
        ctx.fillStyle = this.rgbString;
        ctx.fill()
    }
    cohesion(nearby){
        // Cohesion
        var total_position = new Vector2()
        nearby.forEach(boid => {
            total_position = total_position.add(boid.position)
        })
        const average_position = total_position.scale(1/nearby.length)
        const force = average_position.sub(this.position)
        return force.unit()
    }
    seperate(nearby){
        //Seperation
        var force = new Vector2()
        nearby.forEach(boid => {
            const diff = this.position.sub(boid.position)
            const distance = diff.magnitude()/this.radius
            const delta = diff.scale(1/Math.pow(distance,4))
            force = force.add(delta)
        })
        return force
    }
    avoidDots(){
        //Seperation
        var force = new Vector2()
        var dots = this.enviornment.getNearDots(this)
        dots.forEach(dot => {
            const diff = this.position.sub(dot.position)
            const distance = diff.magnitude()/this.radius
            const delta = diff.scale(1/Math.pow(distance,4))
            force = force.add(delta)
        })
        return force
    }
    align(nearby) {
        // Allignment
        var total_angle = 0
        nearby.forEach(boid => {
           total_angle += boid.velocity.angle()
        })
        const theta = total_angle/nearby.length
        const heading = new Vector2 (Math.cos(theta),Math.sin(theta))
        const force = heading
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
        const nearby = this.enviornment.getNearBoids(this)
        var forces = [this.noise(),this.avoidDots()]
        if (nearby.length > 0) {
            forces.push(this.align(nearby))
            forces.push(this.seperate(nearby))
            forces.push(this.cohesion(nearby))
            forces.push(this.avoidDots())
        }
        var netForce = new Vector2()
        for (let force of forces){
            netForce = netForce.add(force)
        }
        netForce.scale(1/(forces.length+1))
        this.force = netForce.scale(this.maxForce)
        this.velocity = this.velocity.add(this.force)
        if (this.velocity.magnitude() > this.maxSpeed) {
            this.velocity = this.velocity.unit().scale(this.maxSpeed)
        }
        this.position = this.position.add(this.velocity)
        this.draw()
    }
}
class Dot {
    constructor(enviornment, pos = new Vector2() ) {
        this.position = pos
        this.radius = 15
        this.enviornment = enviornment
        enviornment.dots.push(this)
    }
    draw(){
        let canvas = this.enviornment.canvas
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(this.position.x*canvas.width, this.position.y*canvas.height, 15, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle ='rgb(73, 65, 123)'
        ctx.fill()
    }
}
class Enviornment {
    constructor(canvas) {
        this.population = new Array();
        this.canvas = canvas
        this.playing = false
        this.dots = []
    }
    generateBoids(count = 1, pos = new Vector2(Math.random(),Math.random())){
        for (var i = 0; i < count; i++) {
            this.population.push(new Boid(this, pos, this.population.length == 0))
       }
    }
    populate(count){
        for (var i = 0; i < count; i++) {
            this.generateBoids(1)
        }
    }
    dotify(count){
        for (var i = 0; i < count; i++){
            var pos = new Vector2()
            pos.random()
            new Dot(system,pos)
        }
    }
    getNearDots(boid){
        var nearby = new Array();
        this.dots.forEach(dot => {
            const delta = boid.position.sub(dot.position)
            if (delta.magnitude() < boid.radius ) {
                var theta = delta.angle(boid.velocity)
                if (theta < boid.fieldOfView/2) {
                    nearby.push(dot)
                }
            }
        })
        return nearby
    }
    getNearBoids(root_boid){
        var nearby = new Array();
        this.population.forEach(boid => {
            if (boid != root_boid) {
                const delta = boid.position.sub(root_boid.position)
                if (delta.magnitude() < root_boid.radius ) {
                    var theta = delta.angle(root_boid.velocity)
                    if (theta < root_boid.fieldOfView/2) {
                        nearby.push(boid)
                    }
                }
            }
        })
        return nearby
    }
    step(){
        //Clear canvas
        this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);
        //Animate boids
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
        //Draw barriers
        for (let dot of this.dots){
            dot.draw()
        }
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

let system = new Enviornment(document.getElementById('canvas'))
system.populate(150)
system.play()

// Resive canvas

// Mouse Stuff
function onClick(event) {
    var click = new Vector2(event.clientX*1.3,event.clientY*1.3)
    const relativePos = new Vector2(click.x/canvas.width,click.y/canvas.width)
    //system.generateBoids(5,relativePos)
    new Dot(system, relativePos)
  }
  
  document.addEventListener("click", onClick);
  document.body.onkeyup = function(e){
    if(e.keyCode == 32){
        system.toggle()
    }
}