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

addNeuralMutation("Change bias", "Mutate the bias of any neuron", -0.25, () => {})
addNeuralMutation("Add (+) connection", "Add a positive connection", -0.25, () => {})
addNeuralMutation("Add (-) connection", "Add a negative connection", -0.25, () => {})
addNeuralMutation("Remove connection", "Remove a connection", -0.5, () => {})

addBioMutation("Change type", "Change the type of a singular cell.", -0.5, () => {})

function openMutations() {
    let ui = new TabHolder("Mutations");
    ui.add(new Label("Biological Mutations", "Only happens at birth."))
    ui.add(new Table("bio_mutations", ["Name", "Description", "Chance"]))
    for (let i = 0; i < bio_mutations.length; i++) {
        ui.bio_mutations.addRow([bio_mutations[i].name, bio_mutations[i].desc, `${bio_mutations[i].chance} + N`])
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
    let exmaple_holder = new Holder("Example Mutations Output");
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
            exmaple_holder.add(new Label("Mutation #"+i, `${mutations[i].name} - ${((mutations[i].chance + n)*100).toFixed(0)}%`));
        }
    }))
    ui.add(exmaple_holder);
}