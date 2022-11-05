let cam;

/*
    
    '{"text":"INIT","children":[{"text":1,"children":[]},{"text":2,"children":[]},{"text":3,"children":[]},{"text":4,"children":[{"text":5,"children":[{"text":6,"children":[]}]},{"text":7,"children":[]},{"text":8,"children":[{"text":9,"children":[]},{"text":10,"children":[]},{"text":11,"children":[{"text":12,"children":[{"text":13,"children":[]},{"text":14,"children":[{"text":17,"children":[{"text":32,"children":[]},{"text":58,"children":[{"text":65,"children":[]}]},{"text":69,"children":[]}]},{"text":18,"children":[{"text":21,"children":[{"text":42,"children":[{"text":45,"children":[{"text":53,"children":[{"text":61,"children":[]}]},{"text":59,"children":[]}]},{"text":46,"children":[]},{"text":55,"children":[]}]},{"text":44,"children":[{"text":47,"children":[]},{"text":56,"children":[]}]},{"text":49,"children":[]}]},{"text":33,"children":[]}]},{"text":19,"children":[]}]},{"text":16,"children":[{"text":23,"children":[]},{"text":26,"children":[{"text":29,"children":[{"text":31,"children":[{"text":35,"children":[{"text":38,"children":[]}]}]},{"text":36,"children":[{"text":39,"children":[{"text":66,"children":[]}]},{"text":41,"children":[{"text":43,"children":[{"text":48,"children":[{"text":51,"children":[{"text":63,"children":[]}]}]},{"text":50,"children":[{"text":52,"children":[{"text":54,"children":[{"text":62,"children":[]}]},{"text":60,"children":[{"text":70,"children":[]}]},{"text":64,"children":[{"text":68,"children":[]}]}]},{"text":57,"children":[{"text":67,"children":[]}]}]}]}]}]},{"text":40,"children":[]}]}]},{"text":28,"children":[]}]}]},{"text":15,"children":[{"text":22,"children":[{"text":25,"children":[]}]},{"text":24,"children":[]},{"text":27,"children":[{"text":30,"children":[]},{"text":34,"children":[]},{"text":37,"children":[]}]}]},{"text":20,"children":[]}]}]}]}]}'    
    '{"text":"INIT","children":[{"text":1,"children":[{"text":2,"children":[]}]},{"text":3,"children":[]},{"text":4,"children":[{"text":5,"children":[]}]},{"text":6,"children":[]},{"text":7,"children":[]},{"text":8,"children":[{"text":9,"children":[]}]},{"text":10,"children":[]},{"text":11,"children":[]},{"text":12,"children":[]},{"text":13,"children":[]},{"text":14,"children":[]},{"text":15,"children":[]},{"text":16,"children":[]},{"text":17,"children":[]},{"text":18,"children":[{"text":19,"children":[]}]},{"text":20,"children":[{"text":21,"children":[{"text":27,"children":[]},{"text":29,"children":[{"text":36,"children":[]},{"text":50,"children":[{"text":53,"children":[]},{"text":58,"children":[{"text":68,"children":[]}]}]},{"text":57,"children":[{"text":59,"children":[]},{"text":67,"children":[]},{"text":72,"children":[{"text":75,"children":[]},{"text":78,"children":[]},{"text":80,"children":[]}]}]}]},{"text":33,"children":[]}]},{"text":22,"children":[]},{"text":23,"children":[{"text":24,"children":[]},{"text":25,"children":[{"text":28,"children":[{"text":30,"children":[]},{"text":31,"children":[]}]},{"text":32,"children":[{"text":35,"children":[{"text":37,"children":[{"text":40,"children":[{"text":41,"children":[{"text":43,"children":[{"text":51,"children":[{"text":74,"children":[]}]}]}]},{"text":42,"children":[{"text":46,"children":[]},{"text":73,"children":[{"text":76,"children":[]},{"text":77,"children":[{"text":82,"children":[{"text":91,"children":[]}]},{"text":83,"children":[{"text":94,"children":[]}]},{"text":84,"children":[{"text":86,"children":[]}]}]},{"text":81,"children":[{"text":97,"children":[]}]}]}]},{"text":70,"children":[]}]},{"text":44,"children":[]},{"text":45,"children":[{"text":47,"children":[{"text":52,"children":[]}]},{"text":65,"children":[]},{"text":69,"children":[{"text":71,"children":[{"text":79,"children":[{"text":85,"children":[{"text":87,"children":[{"text":88,"children":[]}]},{"text":90,"children":[]}]}]},{"text":92,"children":[]}]},{"text":95,"children":[]},{"text":96,"children":[]}]}]}]},{"text":38,"children":[]},{"text":39,"children":[{"text":48,"children":[{"text":49,"children":[]},{"text":98,"children":[]}]}]}]}]},{"text":34,"children":[{"text":54,"children":[{"text":66,"children":[]}]},{"text":55,"children":[{"text":60,"children":[{"text":62,"children":[]}]},{"text":63,"children":[]},{"text":89,"children":[]}]},{"text":56,"children":[{"text":61,"children":[]},{"text":64,"children":[{"text":93,"children":[]}]}]}]}]},{"text":26,"children":[]}]}]}]}'
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
main.add(new Break());
main.add(new Label("Organisms", 0))
main.add(new Label("Food", 0));
main.add(new Label("Test", 0))

let tree = undefined;
main.add(new Button("Open Tree", () => {
    tree = new TabHolder("Tree");
    tree.add(new Tree("Evolution tree", engine.organism_tree))
}))
let controls = new Holder("Controls");

controls.add(new Slider("Speed", 1, 500, 1, 1, (val) => {
    engine.speed = val;
}));
controls.add(new Button("Toggle Pause", () => {
    engine.paused = !engine.paused
}));
controls.add(new Button("Toggle Rendering", () => {
    engine.rendering = !engine.rendering
}));
controls.add(new Button("Go to center", () => {
    cam.x = 0;
    cam.y = 0;
}));    

main.add(new Label("Ticks", 0))
main.add(new Label("Ticks per second", 0))

controls.collapse();
main.add(controls)
main.collapse();
ui.add(main)

let about = new Holder("About / Help");
about.add(new Label("Selection", "Click on an organism to open \nits UI."))
about.add(new Label("Reading", "If a label is yellow, hover over it.", "This normally holds a bit more information about the variable."))
about.add(new Button("Mutation Helper", openMutations))
about.collapse();
ui.add(about)

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

    ui.Main.Organisms.changeVal(engine.organisms.length)
    ui.Main.Food.changeVal(`${engine.foodGrid.length}/${engine.config.max_food}`)
    ui.Main.Test.changeVal(((engine.ticks % 1000)/500)-1)

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
