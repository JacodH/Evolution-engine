let cam;

/*
    Ideas
    - limit amount of cells with same type in the same organism

    Cell type ideas
    - Stomach cell
        - Each org has 1
        - Max of 3 per org
        - Stores food and turns it into energy when neuron fired
*/

let ui;
let tree;

let engine;

function setup() {
    createCanvas(innerWidth, innerHeight);
    cam = new camera2D(1);
    frameRate(Infinity)
    angleMode(RADIANS)

    engine = new Engine({
        organisms: 1, // starter organisms
        org_prod: 4000, // every x ticks make a new organism
        cells_min: 3, // number of cells in each org
        cells_max: 7, // number of cells in each org
        food_prod: 10, // every x ticks add new food if food.length is under max_food
        starter_food: 2000,
        max_food: 2000,
        radius: 6000
    })
    engine.init()
}

function draw() {
    background(0, 255);
    cam.update();
    engine.update();
    engine.render();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked() {
    engine.click()
}

function mouseWheel(event) {
    if (overTab == true) {return}
    let dir = clamp(event.delta*-1, -1, 1);
    cam.scale(dir/100)
}
