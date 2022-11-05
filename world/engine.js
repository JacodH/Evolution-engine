const MIN_LIFE = 3;

class Engine {
    constructor(config) {
        this.config = config
        this.ticks = 0;

        this.next_org_id = 1;

        this.organism_tree = {
            "text": "INIT",
            "children": [],
            "onclick": () => {
                console.log("INIT")
            }
        };

        this.selected = undefined;

        this.paused = false;
        this.rendering = true;
        this.speed = 1;
    }

    init() {
        this.organisms = [];
        for (let i = 0; i < this.config.organisms; i++) {
            this.addOrganism()
        }

        this.foodGrid = new FoodGrid(this.config.radius/50);
        for (let i = 0; i < this.config.starter_food; i++) {
            this.addFood()
        }
    }

    addOrganism(organism){
        if (organism == undefined) {
            let a = Math.random()*(Math.PI*2)
            let org = new Organism(rng(this.config.cells_min, this.config.cells_max), Math.cos(a)*(Math.random()*this.config.radius), Math.sin(a)*(Math.random()*this.config.radius))
        
            org.id = this.next_org_id;
            this.next_org_id += 1;

            this.organisms.push(org)
            this.organism_tree.children.push({
                "text": org.id,
                "children": [],
                "onclick": () => {
                    org.openUI();
                }
            });
        }else {
            organism.id = this.next_org_id;
            this.next_org_id += 1;

            this.organisms.push(organism);

            /*
                parent = (organism.ancestry[organism.ancestry.length-1])
                
                Find where the parent of this organism is.
                Then add the org to one of its children
            */

            let parent = (organism.ancestry[organism.ancestry.length-1])

            let queue = [...this.organism_tree.children]

            while (queue.length > 0) {

                let n = queue.shift();

                if (n.text == parent) {
                    n.children.push({
                        "text": organism.id,
                        "children": [],
                        "onclick": () => {
                            organism.openUI();
                        }
                    })
                    this.updateTree()
                    return
                }
                
                for (let child of n.children) {
                    
                    if (child.text == parent) {
                        child.children.push({
                            "text": organism.id,
                            "children": [],
                            "onclick": () => {
                                organism.openUI();
                            }
                        })
                        this.updateTree()
                        return
                    }

                    queue.push(child);

                }
            }
        }
    }

    updateTree() {
        if (tree != undefined) {
            tree['Evolution tree'].changeVal(this.organism_tree)
        }
    }

    addFood(x, y, energy) {
        if (x == undefined) {

            let a = Math.random()*(Math.PI*2)
            // let d = randomGaussian(0, 1.5)
            // d *= this.config.radius;
            let d = Math.random()
            d *= this.config.radius;

            this.foodGrid.addFood(new Food(Math.cos(a)*(d), Math.sin(a)*(d)))

        }else {
            this.foodGrid.addFood(new Food(x, y, 0, 0, energy))
        }
    }

    render() {
        if (this.rendering == false) {return}

        // fill(0, 0, 100, 100)
        // ellipse(0, 0, this.config.radius*2);

        for (let i = 0; i < this.organisms.length; i++) {
            this.organisms[i].render();
        }

        this.foodGrid.renderGrid();
    }

    update() {
        if (this.paused == true) {return}
        
        // if (this.organisms.length < MIN_LIFE) {
        //     this.addOrganism()
        // }

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

        ui.Main.Ticks.changeVal(this.ticks)
        ui.Main["Ticks per second"].changeVal(((frameRate() * this.speed) / 1).toFixed())
    }

    click() {
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
}