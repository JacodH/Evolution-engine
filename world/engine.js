class Engine {
    constructor(config) {
        this.config = config
        this.ticks = 0;

        this.next_org_id = 1;

        this.organism_tree = {
            "text": "INIT",
            "org": undefined,
            "children": []
        };

        this.selected = undefined;

        this.paused = false;
        this.rendering = true;
        this.pure_speed = false;
        this.pure_speed_warning = undefined;
        this.speed = 1;
        this.food_val = 0.75;
    }

    init() {
        if (ui != undefined) {
            ui.close();
            ui = undefined;
        }

        
        this.organisms = [];
        for (let i = 0; i < this.config.organisms; i++) {
            this.addOrganism()
        }
        
        this.foodGrid = new FoodGrid(this.config.radius/50);
        for (let i = 0; i < this.config.starter_food; i++) {
            this.addFood()
        }
    
        ui = new TabHolder("Main", false);
        let main = new Holder("Main");
        main.add(new Break());
        main.add(new Label("Organisms", 0))
        // main.add(new Label("Bio mass", 0, "The total available energy inside of the ecosystem."))
        main.add(new Slider("Food", 0, this.config.max_food, this.foodGrid.length, 1));

        tree = new TabHolder("Ancestry Tree");
        tree.add(new Holder("Tree"))
        tree.Tree.add(new Label("DEV", "This feature is going to be changed a lot in the future."))
        tree.Tree.add(new Tree("Ancestry tree", this.organism_tree))
        tree.setPos((innerWidth/10)*8, 300)

        main.add(new Label("Ticks", "0.00k"))
        main.add(new Label("Ticks per second", 0))
        
        let controls = new Holder("Controls");
        controls.add(new Slider("Speed", 1, 1000, 1, 1, (val) => {
            this.speed = val;
        }));
        controls.add(new Button("Toggle Pause", () => {
            this.paused = !this.paused
        }));
        controls.add(new Button("Toggle Rendering", () => {
            this.rendering = !this.rendering
        }));
        controls.add(new Button("Go to center", () => {
            cam.x = 0;
            cam.y = 0;
        }));
        
        controls.collapse()
        controls.collapse()

        main.add(controls)
        ui.add(main)
        
        let about = new Holder("About / Help");
        about.add(new Label("Camera", "Click and drag to move the camera\nscroll to zoom in and out."))
        about.add(new Label("Selection", "Click on an organism to open \nits UI."))
        about.add(new Label("Reading", "If a label is yellow, hover over it.", "This normally holds a bit more information about the variable."))
        about.add(new Button("Mutation Helper", openMutations))
        about.collapse();
        ui.add(about)
        
        let rebirth = new Holder("Rebirth");
        rebirth.add(new Button("Open rebirth controls", () => {
            let ui = new TabHolder("Rebirth controls")
        
            ui.add(new Label("Organism production", "Every (x) frames make\na new random organism."))
            ui.add(new Slider("Organism production_", 100, 10000, this.config.org_prod, 1, () => {}));
            
            ui.add(new Label("Food production", "Every (x) frames make a\nnew food pelet if the current\nammount of food is under the max."))
            ui.add(new Slider("Food production_", 1, 10000, this.config.food_prod, 1, () => {}));
            
            ui.add(new Slider("Max food_", 10, 7000, this.config.max_food, 1, () => {}));
            
            ui.add(new Slider("Radius_", 100, 10000, this.config.radius, 50, () => {}));
            
            ui.add(new Button("Rebirth", () => {
                engine = new Engine({
                    org_prod: ui["Organism production_"].val, // every x ticks make a new organism
                    cells_min: 3, // number of cells in each org
                    cells_max: 6, // number of cells in each org
                    food_prod: ui["Food production_"].val, // every x ticks add new food if food.length is under max_food
                    starter_food: ui["Max food_"].val,
                    max_food: ui["Max food_"].val,
                    radius: ui["Radius_"].val
                });
                ui.close();
                tree.close();
                engine.init()
            }))
        }))
        rebirth.collapse()
        ui.add(rebirth)
        
        let contact = new Holder("Contact me")
        contact.add(new Label("Contact", "If you have any suggestions\nat all feel free to Gmail\nme. Your recommendation will be\nread! Also Gmail me if you\nhappen to see any misspellings"))
        contact.add(new Label("Gmail", "haleyjacob772@gmail.com"))
        contact.collapse()
        ui.add(contact);
    
    }
    
    addOrganism(organism){
        executeAsync(() => {
            if (organism == undefined) {
                let a = Math.random()*(Math.PI*2)
                let org = new Organism(rng(this.config.cells_min, this.config.cells_max), Math.cos(a)*(Math.random()*this.config.radius), Math.sin(a)*(Math.random()*this.config.radius))
            
                org.id = this.next_org_id;
                this.next_org_id += 1;
    
                this.organisms.push(org)
                this.organism_tree.children.push({
                    "text": org.id,
                    "children": [],
                    "org": org
                });
                this.updateTree()
            }else {
                organism.id = this.next_org_id;
                this.next_org_id += 1;
    
                this.organisms.push(organism);
    
                /*
                    parent = (organism.ancestry[organism.ancestry.length-1])
                    
                    Find where the parent of this organism is.
                    Then add the org to the parents child array
                */
    
                let parent = (organism.ancestry[organism.ancestry.length-1])
    
                let queue = [...this.organism_tree.children]
    
                while (queue.length > 0) {
    
                    let n = queue.shift();
    
                    if (n.text == parent) {
                        n.children.push({
                            "text": organism.id,
                            "children": [],
                            "org": organism
                        })
                        this.updateTree()
                        return
                    }
                    
                    for (let child of n.children) {
                        
                        if (child.text == parent) {
                            child.children.push({
                                "text": organism.id,
                                "children": [],
                                "org": organism
                            })
                            this.updateTree()
                            return
                        }
    
                        queue.push(child);
    
                    }
                }
            }
        })
    }

    updateTree() {
        if (tree != undefined) {
            for (let i = 0; i < this.organism_tree.children.length; i++) {
                if (this.organism_tree.children[i].org.alive == false && this.organism_tree.children[i].children.length == 0) {
                    this.organism_tree.children.splice(i, 1);
                    i-=1;
                }
            }

            tree.Tree['Ancestry tree'].changeVal(this.organism_tree)
        }
    }

    addFood(x, y, energy) {
        if (x == undefined) {

            let a = Math.random()*(Math.PI*2)
            let d = Math.random()
            d *= this.config.radius;

            this.foodGrid.addFood(new Food(Math.cos(a)*(d), Math.sin(a)*(d)))

        }else {
            this.foodGrid.addFood(new Food(x, y, 0, 0, energy))
        }
    }

    render() {
        if (this.rendering == false || this.pure_speed == true) {return}

        // fill(0, 0, 100, 100)
        // ellipse(0, 0, this.config.radius*2);

        for (let i = 0; i < this.organisms.length; i++) {
            this.organisms[i].render();
        }

        this.foodGrid.renderGrid();
    }

    update() {
        if (this.paused == true) {return}
        

        for (let s = 0; s < this.speed; s++) {
            this.ticks += 1;
            for (let i = 0; i < this.organisms.length; i++) {
                this.organisms[i].update();
            }

            if (this.ticks % this.config.food_prod == 0) {
                if (this.foodGrid.length < this.config.max_food) {
                    this.addFood()
                }
            }

            if (this.ticks %  this.config.org_prod == 0) {
                this.addOrganism()
            }

        }

        if (this.pure_speed == false) {
            ui.Main["Ticks"].changeVal(`${(this.ticks/1000).toFixed(2)}k`)
            ui.Main["Ticks per second"].changeVal(((frameRate() * this.speed) / 1).toFixed())
            ui.Main.Organisms.changeVal(engine.organisms.length)
            ui.Main.Food.changeVal(engine.foodGrid.length)

            // let bio_mass = 0;
            // bio_mass += this.foodGrid.length * 0.75; // bio mass of food

            // for (let org of this.organisms) {
            //     bio_mass += org.energy; // energy inside that cell
            //     bio_mass += org.cells.length * 0.05; // cell flesh
            // }


            // ui.Main["Bio mass"].changeVal(bio_mass)
        }else {
            this.pure_speed_warning["Ticks per second"].changeVal(((frameRate() * this.speed) / 1).toFixed())
        }
    }

    click() {
        if (overTab == true) {return}
        if (this.selected == undefined) {

            for (let i = 0; i < this.organisms.length; i++) {
                for (let c = 0; c < this.organisms[i].cells.length; c++) {
                    let cell = this.organisms[i].cells[c];
                    
                    if (dist(cam.mx, cam.my, cell.x, cell.y) < 16) {
                        this.organisms[i].selected = true
                        this.organisms[i].openUI();
                        this.selected = this.organisms[i];
                    }
                }
            }

        }else {
            for (let c = 0; c < this.selected.cells.length; c++) {
                let cell = this.selected.cells[c];
                
                if (dist(cam.mx, cam.my, cell.x, cell.y) < 16) {
                    cell.openUI();
                }
            }
        }
    }

    get time() {
        return `${(this.ticks/1000).toFixed(2)}k`
    }
}