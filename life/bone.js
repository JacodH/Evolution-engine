class Bone {
    constructor(c1, c2, d = 32, a = Math.random()*Math.PI*2) {
        this.c1 = c1;
        this.c2 = c2;
        this.d = d;
        this.a = a;
        this.da = 0;
    }

    update() {
        this.a += this.da;
        this.da *= 0.9;
    }
}