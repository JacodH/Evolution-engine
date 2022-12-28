var bio_mutations = [];
var neural_mutations = [];

function addBioMutation(name, desc, chance, func) {
    bio_mutations.push({
        name: name,
        desc: desc,
        chance: chance,
        func: func
    })
}

function addNeuralMutation(name, desc, chance, func) {
    neural_mutations.push({
        name: name,
        desc: desc,
        chance: chance,
        func: func
    })
}

addNeuralMutation("Change bias", "Mutate the bias of any neuron", -0.5, (brain) => {
    let num  = Math.floor(rng(0, brain.nodes.length))
    let before = brain.nodes[num].bias;

    if (!before) {return false}

    brain.nodes[num].bias = clamp(rng(-0.1, 0.1) + brain.nodes[num].bias, NEAT_HP.VALUE.min, NEAT_HP.VALUE.max);

    return `Bias on neuron #${num} was changed from ${before.toFixed(2)} to ${brain.nodes[num].bias.toFixed(2)}`;
})
addNeuralMutation("Add (+) connection", "Add a positive connection", -0.5, (brain) => {
    let possible = [];

    for (let i = 0; i < brain.connections.length; i++) {
        if (brain.connections[i].weight == 0 || brain.connections[i].weight == -1 ) {
            possible.push(i);
        }
    }

    if (possible.length > 0) {
        let num = Math.floor(rng(0, possible.length))

        let connection = brain.connections[possible[num]];

        let before = connection.weight

        brain.connections[possible[num]].weight = 1;

        return `Weight on connection ${connection.innovation_id} was changed from ${before} to 1`;
    }

    return false;
})
addNeuralMutation("Add (-) connection", "Add a negative connection", -0.5, (brain) => {
    let possible = [];

    for (let i = 0; i < brain.connections.length; i++) {
        if (brain.connections[i].weight == 0 || brain.connections[i].weight == 1 ) {
            possible.push(i);
        }
    }

    if (possible.length > 0) {
        let num = Math.floor(rng(0, possible.length))

        let connection = brain.connections[possible[num]];

        let before = connection.weight

        brain.connections[possible[num]].weight = -1;

        return `Weight on connection ${connection.innovation_id} was changed from ${before} to -1`;
    }

    return false;
})
addNeuralMutation("Zero connection", "Zero a connection", -0.5, (brain) => {
    let possible = [];

    for (let i = 0; i < brain.connections.length; i++) {
        if (brain.connections[i].weight == -1 || brain.connections[i].weight == 1 ) {
            possible.push(i);
        }
    }

    if (possible.length > 0) {
        let num = Math.floor(rng(0, possible.length))

        let connection = brain.connections[possible[num]];

        let before = connection.weight

        brain.connections[possible[num]].weight = 0;

        return `Weight on connection ${connection.innovation_id} was changed from ${before} to 0`;
    }

    return false;
})

addBioMutation("Change type", "Change the type of a singular cell.", 0.1, (org) => {
    // let num = Math.floor(rng(0, org.cells.length));
    // let newType = cell_types[Math.floor(Math.random()*cell_types.length)]
    // org.cells[num].type = newType;
    // org.cells[num].neural_vals = [...cell_type_objects[newType].neurons_default];

    // // org.brain.validate();

    // // org.initBrain();

    return false;
})

addBioMutation("Bone structure", "Change the angle of a bone.", 0.25, (org) => {
    let num = Math.floor(rng(0, org.bones.length));
    org.bones[num].a += rng(-Math.PI/5, Math.PI/5)
})


function openMutations() {
    let ui = new TabHolder("Mutations");
    ui.add(new Label("Biological Mutations", "Only happens at birth."))
    ui.add(new Table("bio_mutations", ["Name", "Description", "Chance"]))
    for (let i = 0; i < bio_mutations.length; i++) {
        ui.bio_mutations.addRow([bio_mutations[i].name, bio_mutations[i].desc, `${bio_mutations[i].chance}`])
    }

    ui.add(new Break());
    ui.add(new Break());
    ui.add(new Break());
    ui.add(new Label("Neurological Mutations", "Happens frequently through the organisms life."))
    ui.add(new Table("neural_mutations", ["Name", "Description", "Chance"]))
    for (let i = 0; i < neural_mutations.length; i++) {
        ui.neural_mutations.addRow([neural_mutations[i].name, neural_mutations[i].desc, `${neural_mutations[i].chance} + N`])
    }

    ui.add(new Break());
    ui.add(new Break());
    ui.add(new Break());
    ui.add(new Label("Example", "Neurological Mutation"));
    ui.add(new Slider("Mutation Strength (N)", -1, 1, 0, 0.01, () => {}))
    let exmaple_holder = new Holder("Example Mutations Log");
    ui.add(new Button("Generate example mutation", () => {
        exmaple_holder.clear();
        let n = ui["Mutation Strength (N)"].val;

        let mutations = [];
        for (let i = 0; i < neural_mutations.length; i++) {
            if (Math.random() < neural_mutations[i].chance + n) {
                mutations.push(neural_mutations[i]);
            }
        }

        for (let i = 0; i < mutations.length; i++) {
            exmaple_holder.add(new Label("Mutation #"+(i+1), `${mutations[i].name} - ${((mutations[i].chance + n)*100).toFixed(0)}%`));
        }
    }))
    ui.add(exmaple_holder);

    ui.add(new Break());
    ui.add(new Label("Example", "Biological Mutation"));
    let exmaple_holder2 = new Holder("Example Mutations Log");
    ui.add(new Button("Generate example mutation", () => {
        exmaple_holder2.clear();
        let mutations = [];
        for (let i = 0; i < bio_mutations.length; i++) {
            if (Math.random() < bio_mutations[i].chance) {
                mutations.push(bio_mutations[i]);
            }
        }

        for (let i = 0; i < mutations.length; i++) {
            exmaple_holder2.add(new Label("Mutation #"+(i+1), `${mutations[i].name} - ${((mutations[i].chance)*100).toFixed(0)}%`));
        }
    }))
    ui.add(exmaple_holder2);
}