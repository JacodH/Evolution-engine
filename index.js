let cam;

/*
    Ideas
    - limit amount of cells with same type in the same organism
        - Keeps it clean and just better in general
    - rotater rotates every cell inside the organism instead of only connected cells
        - makes movement easier for orgs

    Cell type ideas
    - Stomach cell
        - Each org has 1 no matter what
        - Max of 3 per org
        - Stores food and turns it into energy if fired
*/

let ui = new TabHolder("Main", false);
let main = new Holder("Main");
main.add(new Label("Help", "Click on an organism to open \nits UI."))
main.add(new Break());

let controls = new Holder("Controls");

controls.add(new Slider("Speed", 1, 100, 1, 1, (val) => {
    engine.speed = val;
}));
controls.add(new Button("Toggle Pause", () => {
    engine.paused = !engine.paused
}));
controls.add(new Button("Go to center", () => {
    cam.x = 0;
    cam.y = 0;
}));
controls.add(new Button("Mutations", () => {
    openMutations()
}))

main.add(controls)
ui.add(main)

let engine;

function setup() {
    createCanvas(innerWidth, innerHeight);
    cam = new camera2D(1);
    frameRate(Infinity)
    angleMode(RADIANS)

    engine = new Engine({
        organisms: 10,
        cells: 3,
        food_prod: 3000,
        starter_food: 250,
        max_food: 250,
        radius: 5000
    })
}

function draw() {
    background(25, 255);
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
