const MAX_KIDS = 3;
const MAX_AGE = 25_000;
const MATURITY_AGE = 1_500

class Organism {
    constructor(n, x, y) {
        this.birthdate = engine.ticks;
        this.death = undefined;

        this.alive = true;

        this.selected = false;
        this.ui = undefined;

        this.energy = 1;
        this.health = 100;
        this.age = 0;

        this.children = 0;

        this.brain_mutation_rate = 7500;
        this.brain_timer = 0;

        this.brain_energy_last = this.energy;        
        this.brain_health_last = this.health;        

        this.brain_fitness = 0;

        this.ancestry = ["INIT"]

        if (n == "Copy") {
            this.cells = [];
            this.bones = [];

            let a = Math.random()*Math.PI*2;

            let xpos = x.cells[0].x;
            let ypos = x.cells[0].y;
            
            let a2 = Math.random()*Math.PI*2
            
            xpos += Math.cos(a2) * 300
            ypos += Math.sin(a2) * 300

            let dx = -(x.cells[0].x - xpos) / 50;
            let dy = -(x.cells[0].y - ypos) / 50;

            for (let i = 0; i < x.cells.length; i++) {
                this.cells.push(new Cell(i, this, xpos, ypos, x.cells[i].a + a, x.cells[i].type));
                this.cells[i].dx = dx;
                this.cells[i].dy = dy;
            }

            for (let i = 0; i < x.bones.length; i++) {
                this.bones.push(new Bone(x.bones[i].c1, x.bones[i].c2, x.bones[i].d, x.bones[i].a));
            }

            this.energy = 0;

            this.brain = x.brain.copy();

            this.ancestry = [...x.ancestry];
            this.ancestry.push(x.id)

            // mutate this biololgically.

            for (let i = 0; i < bio_mutations.length; i++) {
                for (let i = 0; i < bio_mutations.length; i++) {
                    if (Math.random() < bio_mutations[i].chance) {
                        bio_mutations[i].func(this);
                    }
                }
            }

        }else {
            let a = Math.random()*Math.PI*2
    
            this.cells = [new Cell(0, this, x, y, a)];
            this.bones = [];
    
            for (let i = 1; i < n; i++) {
                this.cells.push(new Cell(i, this, x+i, y+i, a))
                let cell2 = Math.floor(Math.random()*i)
                this.bones.push(new Bone(i, cell2, 32))
            }

            this.initBrain();
        }
    }

    initBrain() {
        let inputs = ["Always", "Energy", "Clock"];
        let outputs = [];
        for (let i = 0; i < this.cells.length; i++) {
            if (cell_type_objects[this.cells[i].type].neuron_type == "Input") {
                this.cells[i].brain_index = inputs.length;

                let inp = [];

                for (let j = 0; j < cell_type_objects[this.cells[i].type].neurons.length; j++) {
                    inp.push(`${this.cells[i].type} - ${cell_type_objects[this.cells[i].type].neurons[j]}`)
                }

                inputs.push(...inp)

                // inputs.push(...cell_type_objects[this.cells[i].type].neurons)
            }
        }
        for (let i = 0; i < this.cells.length; i++) {
            if (cell_type_objects[this.cells[i].type].neuron_type == "Output") {
                this.cells[i].brain_index = inputs.length+outputs.length;

                let inp = [];

                for (let j = 0; j < cell_type_objects[this.cells[i].type].neurons.length; j++) {
                    inp.push(`${this.cells[i].type} - ${cell_type_objects[this.cells[i].type].neurons[j]}`)
                }

                outputs.push(...inp)
            }
        }

        this.brain_inputs = inputs;
        this.brain_outputs = outputs;

        
        this.brain = new Genome([inputs, outputs]);


        // minor some mutation 
        for (let i = 0; i < neural_mutations.length; i++) {
            if (Math.random() < neural_mutations[i].chance + 1) {
                neural_mutations[i].func(this.brain);
            }
        }
    }

    getCell(id) {for (let i = 0; i < this.cells.length; i++) {if (this.cells[i].id == id) {return this.cells[i]}}}

    die() {
        this.alive = false;
        this.death = engine.ticks
        if (engine.selected != undefined) {
            if (engine.selected.birthdate == this.birthdate) {
                engine.selected.closeUI()
                engine.selected = undefined;
            }
        }
        for (let i = 0; i < engine.organisms.length; i++) {
            if (engine.organisms[i].birthdate == this.birthdate) {
                engine.organisms.splice(i, 1)
            }
        }
    }

    lay() {
        if (this.children < MAX_KIDS) {
            this.children += 1;
            let a = Math.random()*(Math.PI*2)
            engine.addOrganism(new Organism("Copy", this))
        }
    }

    mutate_brain() {
        /*
        
            The brain will mutate more if the energy gained is negative

        */

        let energy_change = (this.energy - this.brain_energy_last) + (this.health - this.brain_health_last);
        this.brain_energy_last = this.energy;
        this.brain_health_last = this.health;

        let n = energy_change * -1

        for (let i = 0; i < neural_mutations.length; i++) {
            if (Math.random() < neural_mutations[i].chance + n) {
                neural_mutations[i].func(this.brain);
            }
        }
    }

    update() {
        this.energy = clamp(this.energy, -1, this.cells.length)
        this.health = clamp(this.health, 0, 100)
        this.age += 1;

        if (this.energy <= -1) {
            this.health -= 0.01
        }
        if (this.energy > 0.1 && this.age < MAX_AGE) {
            this.health += 0.01;
        }

        if (this.health <= 0) {
            this.die();
        }

        if (this.energy > (this.cells.length/10)*8 && this.children < MAX_KIDS && this.age > MATURITY_AGE) {
            this.lay();
            this.energy = 1;
        }

        this.brain_timer += 1;

        if (this.brain_timer > this.brain_mutation_rate) {
            this.brain_timer = 0;
            this.mutate_brain();
        }

        // load inputs
        let inputs = [1, this.energy/this.cells.length, ((engine.ticks % 100)/50)-1];
        for (let i = 0; i < this.cells.length; i++) {

            if (cell_type_objects[this.cells[i].type].neuron_type == "Input") {
                // this cell inputs data to the brain

                inputs.push(...this.cells[i].neural_vals)
            }

        }

        let out = this.brain.process(inputs)
        let oi = 0;

        for (let i = 0; i < this.cells.length; i++) {

            if (cell_type_objects[this.cells[i].type].neuron_type == "Output") {
                // this cell inputs data to the brain
                let tiny_input = [];
                for (let c = 0; c < cell_type_objects[this.cells[i].type].neurons.length; c++) {
                    tiny_input.push(out[oi+c])
                }
                this.cells[i].neural_vals = tiny_input;

                oi += tiny_input.length;
            }

        }

        for (let i = 0; i < this.bones.length; i++) {
            let bone = this.bones[i];
            bone.update();

            let c1 = this.getCell(bone.c1);
            let c2 = this.getCell(bone.c2);

            let d = bone.d;
            let a = bone.a;

            let midx = (c1.x + c2.x) / 2
            let midy = (c1.y + c2.y) / 2

            let wantedc1x = midx + (Math.cos(a) * (d/2));
            let wantedc1y = midy + (Math.sin(a) * (d/2));

            c1.dx += (c1.x - wantedc1x) * -0.01
            c1.dy += (c1.y - wantedc1y) * -0.01

            let wantedc1x2 = midx + (Math.cos(a+Math.PI) * (d/2));
            let wantedc1y2 = midy + (Math.sin(a+Math.PI) * (d/2));

            c2.dx += (c2.x - wantedc1x2) * -0.01
            c2.dy += (c2.y - wantedc1y2) * -0.01
        }

        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].update()
        }

        this.updateUI();
        this.brain.updateUI()

    }

    render() {
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].render();
        }
    }

    timeAlive() {
        return `${(this.death || engine.ticks - this.birthdate).toFixed(2) / 1000}k` // how many TPS this org was alive
    }

    openUI() {
        if (this.ui != undefined) { return }
        let ui = new TabHolder("Organism #"+this.id, true, () => {
            this.closeUI();
            this.selected = false;
            engine.selected = undefined;
        });
        if (this.alive == true) {
            ui.add(new Label("Help", "Click on a cell that is highlighted \nto open that cell's UI.\nClose this tab to unselect\nthe organism."));
        }
        ui.add(new Label("Cells", this.cells.length));
        ui.add(new Label("Birthdate", this.birthdate));
        ui.add(new Label("Time of death", this.death));
        ui.add(new Label("Ticks alive", `${this.timeAlive()} Ticks`));
        let stats = new Holder("Stats");
        stats.add(new Slider("Age", 0, MAX_AGE, this.age, 1));
        stats.add(new Slider("Children", 0, MAX_KIDS, this.children, 1));
        if (this.alive == true) {
            stats.add(new Slider("Energy", -1, this.cells.length, this.energy, 0.01));
            stats.add(new Slider("Health", 0, 100, this.health, 0.01));
            stats.add(new Slider("Brain timer", 0, this.brain_mutation_rate, this.brain_timer, 1));
            stats.add(new Label("Energy last", this.brain_energy_last));
            stats.add(new Slider("Effiency Diff", -1, 1, (this.energy - this.brain_energy_last) + (this.health - this.brain_health_last), 0.01));
        }
        stats.collapse();
        ui.add(stats);

        // if (this.alive == false) {
            
            ui.add(new Canvas("Anatomy", (p, org = this) => {
                p.setup = function() {
                    p.createCanvas(350, 150);

                    // p.background(100, 120, 120)
                    p.translate(p.width/2, p.height/2)

                    let cells = structuredClone(org.cells);
                    let bones = structuredClone(org.bones);

                    for (let i = 0; i < cells.length; i++) {
                        cells[i].x = rng(-10, 10);
                        cells[i].y = rng(-10, 10);
                    }

                    function getCell(id) {
                        for (let i = 0; i < cells.length; i++) {
                            if (cells[i].id == id) {
                                return cells[i];
                            }
                        }
                    }


                    for (let t = 0; t < cells.length; t++) {
                        for (let i = 0; i < bones.length; i++) {
                            let bone = bones[i];
                            // bone.update();
    
                            bone.a += bone.da;
                            bone.a = bone.a % (Math.PI*2)
    
                            bone.da *= 0.9;
                
                            let c1 = getCell(bone.c1);
                            let c2 = getCell(bone.c2);
                
                            let d = bone.d;
                            let a = bone.a;
                
                            let midx = (c1.x + c2.x) / 2
                            let midy = (c1.y + c2.y) / 2
                
                            let wantedc1x = midx + (Math.cos(a) * (d/2));
                            let wantedc1y = midy + (Math.sin(a) * (d/2));
                
                            c1.x = wantedc1x
                            c1.y = wantedc1y
                
                            let wantedc1x2 = midx + (Math.cos(a+Math.PI) * (d/2));
                            let wantedc1y2 = midy + (Math.sin(a+Math.PI) * (d/2));
                
                            c2.x = wantedc1x2
                            c2.y = wantedc1y2
                        }
                    }
            
                    for (let i = 0; i < cells.length; i++) {
                        p.fill(cell_type_objects[cells[i].type].color);
                        p.ellipse(cells[i].x, cells[i].y, 32, 32);

                        if (cell_type_objects[cells[i].type].neuron_type == "Input") {
                            p.line(cells[i].x - 3, cells[i].y, cells[i].x + 3, cells[i].y);
                            p.line(cells[i].x, cells[i].y-3, cells[i].x, cells[i].y+3);
                        }else if (cell_type_objects[cells[i].type].neuron_type == "Output") {
                            p.line(cells[i].x - 3, cells[i].y, cells[i].x + 3, cells[i].y);
                        }
                    }

                }
            }))

        // }

        ui.add(new Button("Open Brain", () => {
            this.brain.openUI()
        }))
        if (this.alive == true) {
            ui.add(new Button("Kill", () => {
                this.health = 0;
                this.energy = 0;
            }))
            ui.add(new Button("Lay", () => {
                this.lay();
            }))
            ui.add(new Button("Feed", () => {
                this.energy += 0.75;
            }))
        }

        
        
        ui.setPos(((innerWidth/10)*3.5), 300)


        this.ui = ui;
    }

    updateUI() {
        if (this.ui == undefined) {return}

        this.ui.Stats.Cells = this.cells.length;
        this.ui["Time of death"].changeVal(this.death);
        this.ui["Ticks alive"].changeVal(`${this.timeAlive()} Ticks`)
        this.ui.Stats.Energy.changeVal(this.energy);
        this.ui.Stats.Health.changeVal(this.health);
        this.ui.Stats.Age.changeVal(this.age);
        this.ui.Stats.Children.changeVal(this.children);
        this.ui.Stats["Brain timer"].changeVal(this.brain_timer);
        this.ui.Stats["Energy last"].changeVal(this.brain_energy_last);
        this.ui.Stats["Effiency Diff"].changeVal((this.energy - this.brain_energy_last) + (this.health - this.brain_health_last));
        cam.goto(this.cells[0].x, this.cells[0].y)
    }

    closeUI() {
        if (this.ui == undefined) { return }
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].closeUI();
        }
        this.brain.closeUI();
        this.ui.close();
        this.ui = undefined;
    }
}