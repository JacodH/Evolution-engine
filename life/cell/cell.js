class Cell {
    constructor(id, org, x, y, a = Math.random()*(Math.PI*2)) {
        this.id = id;
        this.org = org;

        this.x = x;
        this.y = y;
        this.a = a;

        this.dx = 0;
        this.dy = 0;
        this.da = 0;

        this.friction = 0.95;

        this.type = cell_types[Math.floor(Math.random()*cell_types.length)];
        this.fired = false;
        this.neural_vals = [...cell_type_objects[this.type].neurons_default]; // some cell types have multiple neural values
        this.brain_index = 0;

        this.ui = undefined;
    }

    update() {
        this.dx *= this.friction;
        this.dy *= this.friction;

        this.da *= 0.9;

        this.x += this.dx;
        this.y += this.dy;

        this.a += this.da;
        this.a = this.a % (Math.PI*2)

        this.org.energy -= cell_type_objects[this.type].energy_cost;
        cell_type_objects[this.type].update(this);

        if (this.type != "Plant") {
            for (let i = 0; i < engine.food.length; i++) {
                let d = dist(engine.food[i].x, engine.food[i].y, this.x, this.y);
                if (d < 22) {
                    engine.food.splice(i, 1);
                    this.org.energy += 0.5;
                    return
                }
            }
        }

    }

    render() {
        fill(cell_type_objects[this.type].color);
        if (this.org.selected == true) {
            stroke(255, 255, 0);
        }else {
            stroke(0, 0, 0, 255)
        }
        ellipse(this.x, this.y, 32, 32);
        // line(this.x + Math.cos(this.a) * 16, this.y + Math.sin(this.a) * 16, this.x + Math.cos(this.a) * 10, this.y + Math.sin(this.a) * 10)

        if (cell_type_objects[this.type].neuron_type == "Input") {
            line(this.x - 3, this.y, this.x + 3, this.y);
            line(this.x, this.y-3, this.x, this.y+3);
        }else if (cell_type_objects[this.type].neuron_type == "Output") {
            line(this.x - 3, this.y, this.x + 3, this.y);
        }

        cell_type_objects[this.type].render(this);

        this.updateUI();
    }

    applyForce(x, y) {
        this.dx += x;
        this.dy += y;
    }

    rotate(a) {
        this.a += a;
        for (let i = 0; i < this.org.bones.length; i++) {
            let bone = this.org.bones[i];
            if (bone.c1 == this.id) {
                bone.a += a;
                this.org.getCell(bone.c2).a += a;
            }else if (bone.c2 == this.id) {
                bone.a += a;
                this.org.getCell(bone.c1).a += a;
            }
        }
    }

    move(speed) {
        this.dx += Math.cos(this.a) * speed * 0.025;
        this.dy += Math.sin(this.a) * speed * 0.025;
    }

    openUI() {
        if (this.ui != undefined) { return }
        let ui = new TabHolder("Cell", true, () => {
            this.closeUI();
        })
        ui.add(new Label("type", this.type, cell_type_objects[this.type].desc));

        ui.add(new Slider("Angle", 0, Math.PI*2, this.a, 0.01, (val) => {
            this.a = val;
        }))

        let neural_holder = new Holder("Neural values");

        neural_holder.add(new Label("Neuron type", cell_type_objects[this.type].neuron_type, "This is the type of neuron this cell is producing/using."))
        for (let i = 0; i < cell_type_objects[this.type].neurons.length; i++) {
            neural_holder.add(new Slider(`${cell_type_objects[this.type].neurons[i]}[${i+this.brain_index}]`, NEAT_HP.VALUE.min, NEAT_HP.VALUE.max, this.neural_vals[i], 0.01, (val) => {
                this.neural_vals[i] = val;
            }))
        }

        ui.add(neural_holder)

        ui.setPos(mouseX + (Math.cos(this.a) * 300), mouseY + (Math.sin(this.a) * 300))

        this.ui = ui;
    }

    updateUI() {
        if (this.ui == undefined) { return }

        stroke(cell_type_objects[this.type].color, 255)
        line(this.x, this.y, cam.camX(this.ui.ele.offsetLeft), cam.camY(this.ui.ele.offsetTop))

        for (let i = 0; i < cell_type_objects[this.type].neurons.length; i++) {
            this.ui["Neural values"][`${cell_type_objects[this.type].neurons[i]}[${i+this.brain_index}]`].changeVal(this.neural_vals[i])
        }
    }

    closeUI() {
        if (this.ui == undefined) { return }
        this.ui.close();
        this.ui = undefined;
    }
}

