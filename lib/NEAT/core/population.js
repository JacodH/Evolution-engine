// The population class holds neural networks
// It also can speciate them and create a new generation of nets

// If your using it for neuro evolution with 
// Live data, so teaching it how to play a game
// Or something most of the time you wont use the train funciton

// you'll do something like this
// 1. Using your own program to evalute network fitness
// 2. Then use Speicate and Evolve to create a new gen of hopefully better netkworks


/*
  Train function: 
    if given valid traning data will give each net a 
    fitness on that set training data

    valid traning data: 
    [
      { input: [0, 0], output: [0] },
      { input: [1, 0], output: [1] },
      { input: [0, 1], output: [1] },
      { input: [1, 1], output: [0] }
    ]

  Speciate function:
    Sorts the population into different species

  Evolve function: 
    Speciates networks
    Creates a new generation by mutating and breeding 
    networks.
*/

class Population {
  constructor(n, dna, wanted_species) {
    this.networks = [];
    this.dna = dna;
    this.wanted_species = wanted_species || Math.floor(n * 0.3);

    for (let i = 0; i < n + 1; i++) {
      let brain = new Genome(dna);
      brain.fitness = 0;
      this.networks.push(brain)
    }

    this.networks[0].fitness = 1;

    this.highest_fitness = 1;
    this.evolutions = 0;

    this.using_ui = false;

    this.avg_fitness = [];
  }

  train(training_data, epoch, done) {

    /*
      ML function 
       - This can only be used when you KNOW what 
         the ouputs of the network are supposed to be

      Function outline 
       - Shuffle all training data
       - Loop through all traning data : i
         - Inside that loop loop through all networks : n
            - Process the inputs (i) for network (n)
            - If network gets it right add it it's fitness 
            - The addesd fitness is 1/(traning_data.length/epochs)
            - That makes it so if a network gets it right for every single epoch its final score will be a 1
    */
    training_data.sort(() => .5 - Math.random());

    let ed = 100 / (epoch - 1);

    let e = 0;
    let training = setInterval(() => {
      e += 1;


      for (let n = 0; n < this.networks.length; n++) {

        let fitness = 0;

        for (let i = 0; i < training_data.length; i++) {

          // e: current epoch
          // i: current training data
          let x = training_data[i];
          // n: current network
          let network = this.networks[n];

          // process x.inputs
          let res = network.process(x.input)

          // get error of network res
          for (let o = 0; o < res.length; o++) {
            fitness += x.test(res);
          }

        }

        this.networks[n].fitness = fitness;

      }

      this.evolve()

      if (e >= epoch) {
        clearInterval(training)

        if (done) {
          done();
        }
      }
    }, 0)
  }

  evolve() {
    this.evolutions += 1;
    /*
      Scary
    */

    let avg_fitness = 0;
    this.networks.map((a) => {
      avg_fitness += a.fitness
    })
    avg_fitness /= this.networks.length - 1

    this.avg_fitness.push(avg_fitness)

    if (this.using_ui == true) {
      this.ui[this.ui_name]["Live data"]["Evolutions"].changeVal(this.evolutions)
      this.ui[this.ui_name]["Live data"]["Avg. Fitness"].setData(this.avg_fitness)
    }

    this.speciate()
    // Just mutation no cross over
    // Of the worst 10% of networks 5% will be coppies of the top networks mutated
    // The other 5% will be new networks

    this.networks = this.networks.sort((a, b) => {
      return b.fitness - a.fitness
    })

    // this.networks.map(a => {console.log(a.fitness)})
    let fitness_max = this.networks[0].fitness;
    let fitness_min = this.networks[this.networks.length - 1].fitness;


    // Top 90%
    for (let i = 0; i < this.networks.length; i++) {
      // the closer the input is to 1 the more it will mutate
      if (i / this.networks.length < 0.75) {
        this.networks[i].mutate(scale(this.networks[i].fitness, fitness_min, fitness_max, 1, 0))
      } else {
        // the worst of the worst 10%
        // let brain = new Genome(this.dna)
        // brain.fitness = 0;
        // this.networks[i] = brain;

        let brain = this.networks[Math.floor(rng(0, this.networks.length * 0.5))].copy();
        brain.fitness = 0;
        brain.mutate(0.8)
        this.networks[i] = brain;
      }
    }

  }

  speciate() {
    /*
      Scary
    */
  }

  setUI(ui, name = "Population") {
    this.using_ui = true;
    this.ui = ui;
    this.ui_name = name;

    let main = new Holder(this.ui_name);
    main.add(new Label("Networks", this.networks.length))
    main.add(new Label("Starter dna", "[" + this.dna.join(", ") + "]"))
    // main.add(new Label("Speices", 0));
    // main.add(new Label("Wanted Speices", this.wanted_species))

    let live_data = new Holder("Live data")
    live_data.add(new Label("Evolutions", this.evolutions))
    live_data.add(new Graph("Avg. Fitness", this.avg_fitness))
    live_data.add(new Button("Open A Network", () => {
      let tab = new TabHolder("Open Network")
      tab.add(new Label("Note", "Networks are sorted by fitness from greatest to least"))
      let wanted_ai = 0;
      let bc = undefined;
      tab.add(new Label("Fitness", this.networks[0].fitness));
      tab.add(new Slider("Pick AI From Index", 0, this.networks.length - 1, 0, 1, (val) => {
        wanted_ai = val;
        tab.Fitness.changeVal(this.networks[val].fitness)
      }))
      tab.add(new Button("Open AI", () => {
        let tab2 = new TabHolder(`Brain ${wanted_ai}`)
        bc = this.networks[wanted_ai].copy();
        bc.setUI(tab2, "Brain")
        tab2 = new TabHolder(`Brain ${wanted_ai}`)
        bc = this.networks[wanted_ai].copy();
        bc.setUI(tab2, "Brain")
        tab2.close()
      }))
    }))

    main.add(live_data)

    this.ui.add(main)
  }
}