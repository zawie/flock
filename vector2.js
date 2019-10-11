class Vector2 {
    constructor (a,b) {
        this.x = a
        this.y = b
    }
    unit(){
        s = pow(a,2) + pow(b,2) + pow(c,2)
        return pow(s,1/2)
    }
}

pos = new Vector2(1,2)
console.log(pos)