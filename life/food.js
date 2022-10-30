class Food {
    constructor(x, y, energy = 0.5) {
        this.x = x;
        this.y = y;

        this.energy = energy;
    }

    update() {
        // this.x += this.dx;
        // this.y += this.dy;
    
        // this.dx *= 0.99;
        // this.dy *= 0.99;
    }

    render() {
        fill(0, 255, 100);
        stroke(0, 0, 0, 255);
        ellipse(this.x, this.y, 10, 10);
    }
}