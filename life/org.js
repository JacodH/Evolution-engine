class Organism {
    constructor(n, x, y) {
        this.birthdate = Date.now();

        let a = Math.random()*Math.PI*2

        this.cells = [new Cell(0, this, x, y, a)];
        this.bones = [];

        this.energy = 0;
        this.health = 100;

        for (let i = 1; i < n; i++) {
            this.cells.push(new Cell(i, this, x+i, y+i, a))
            let cell2 = Math.floor(Math.random()*i)
            this.bones.push(new Bone(i, cell2, 32))
        }

        this.selected = false;
        this.ui = undefined;
        
        let inputs = 1; // energy
        let outputs = 0;
        for (let i = 0; i < this.cells.length; i++) {
            if (cell_type_objects[this.cells[i].type].neuron_type == "Input") {
                this.cells[i].brain_index = inputs;
                inputs += cell_type_objects[this.cells[i].type].neurons.length;
            }
        }
        for (let i = 0; i < this.cells.length; i++) {
            if (cell_type_objects[this.cells[i].type].neuron_type == "Output") {
                this.cells[i].brain_index = inputs+outputs;
                outputs += cell_type_objects[this.cells[i].type].neurons.length;
            }
        }

        this.brain_inputs = inputs;
        this.brain_outputs = outputs;

        this.brain = new Genome([inputs, outputs]);
    }

    getCell(id) {for (let i = 0; i < this.cells.length; i++) {if (this.cells[i].id == id) {return this.cells[i]}}}

    die() {
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

    mutate(n) {
        /*
            n = strength of mutation

            

        */
    }

    update() {
        this.energy = clamp(this.energy, -1, this.cells.length)

        if (this.energy <= -1) {
            this.health -= 0.01
        }

        if (this.health < 0) {
            this.die();
        }

        // load inputs
        let inputs = [this.energy/this.cells.length];
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

    }

    render() {
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].render();
        }
        this.updateUI();
        this.brain.updateUI()
    }

    openUI() {
        if (this.ui != undefined) { return }
        let ui = new TabHolder("Organism", true, () => {
            this.closeUI();
            this.selected = false;
            engine.selected = undefined;
        });
        ui.add(new Label("Help", "Click on a cell that is highlighted \nto open that cell's UI.\nClose this tab to unselect\nthe organism."));
        ui.add(new Label("Cells", this.cells.length));
        ui.add(new Slider("Energy", -1, this.cells.length, this.energy, 0.01));
        ui.add(new Slider("Health", 0, 100, this.health, 0.01));
        ui.add(new Button("Open Brain", () => {
            this.brain.openUI()
        }))
        ui.add(new Button("Kill", () => {
            this.die();
        }))

        ui.setPos(innerWidth-(innerWidth/10), 200)

        this.ui = ui;
    }

    updateUI() {
        if (this.ui == undefined) {return}

        this.ui.Cells = this.cells.length;
        this.ui.Energy.changeVal(this.energy);
        this.ui.Health.changeVal(this.health);
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