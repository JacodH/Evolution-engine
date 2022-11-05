class Food {
    constructor(x, y, energy = 0.75) {
        this.x = x;
        this.y = y;

        this.energy = energy;
    }
    render() {
        fill(0, 255, 100);
        stroke(0, 0, 0, 255);
        ellipse(this.x, this.y, 10, 10);
    }
}