class Genome {
  constructor(dna, auto_init = true) {
    this.nodes = [];
    this.connections = [];

    this.next_node_id = 0;
    this.layers = 0;

    this.dna = dna;

    this.ui = undefined;
    this.ui_name = undefined;

    if (auto_init == true) {
      this.init(dna);
    }

    this.ui_editor = undefined;
    this.ui_processor = undefined;
  }

  addNode(layerORnode, name) {
    if (layerORnode instanceof Node) {
      layerORnode.genome = this;
      this.nodes.push(layerORnode)
    } else {
      this.nodes.push(new Node(this.next_node_id, layerORnode, this, name));
    }
    this.next_node_id++;
  }

  getNode(id) {
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].id == id) { return this.nodes[i] }
    }
  }

  addConnection(n1, n2, weight) {
    if (n1 instanceof Connection) {
      this.connections.push(n1)
    } else {
      this.connections.push(new Connection(n1, n2, weight))
    }
  }

  spaceLayers(layer_between) {
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].layer >= layer_between) {
        this.nodes[i].layer += 1;
      }
    }
  }

  init(layerdata) {
    this.processes = 0;

    for (let i = 0; i < layerdata.length; i++) {
      if (layerdata[i] instanceof Array) {
        for (let n = 0; n < layerdata[i].length; n++) {
          this.addNode(i, `${layerdata[i][n]}`);
        }
        this.layers += 1;
      }else {
        for (let n = 0; n < layerdata[i]; n++) {
          this.addNode(i)
        }
        this.layers += 1;
      }
    }

    // init connections
    for (let i = 1; i < this.layers; i++) {

      let pl = this.getLayer(i - 1); // previous layer
      let l = this.getLayer(i); // layer

      // make connections between the previus layer and layer
      for (let i = 0; i < l.length; i++) {
        for (let j = 0; j < pl.length; j++) {
          if (Math.random() < NEAT_HP.INIT.CONNECTION_CHANCE) {

            let n1 = l[i];
            let n2 = pl[j];

            this.addConnection(n2.id, n1.id, NEAT_HP.INIT.CONNECTION_VAL)

          }
        }
      }
    }

    this.initialized = true;
  }

  getLayer(layer) {
    let outputs = [];
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].layer == layer) {
        outputs.push(this.nodes[i]);
      }
    }
    return outputs
  }

  getLayerData() {
    let output = [];
    for (let i = 0; i < this.layers; i++) {
      output.push(this.getLayer(i).length)
    }
    return output
  }

  getConnected(n) {
    let connected = [];

    for (let i = 0; i < this.connections.length; i++) {

      let c = this.connections[i];

      if (c.n2 == n) {
        connected.push(c)
      }

    }

    return connected;
  }

  process(arr) {
    this.processes += 1;

    let inputs = this.getLayer(0);
    if (arr.length != inputs.length) { return console.error("NEAT.js: the input array for the brain must match the amount of input neurons. ") }

    // set the input neuron values to the corisponding given input value
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].val = arr[i];
    }

    // fire all neurons inbetween the input and output layers
    // so layers 1 through this.layers-1
    for (let i = 1; i < this.layers; i++) {
      let layer = this.getLayer(i);

      for (let j = 0; j < layer.length; j++) {
        layer[j].fire()
      }
    }

    let output = [];
    let outputs = this.getLayer(this.layers - 1);

    for (let i = 0; i < outputs.length; i++) {
      output.push(outputs[i].val)
    }

    // update ui
    if (this.ui) {
      this.updateUI(this.ui);
    }

    return output
  }

  fry() {
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].bias = rng(NEAT_HP.BIAS.min, NEAT_HP.BIAS.max);
    }

    for (let i = 0; i < this.connections.length; i++) {
      this.connections[i].weight = rng(NEAT_HP.WEIGHT.min, NEAT_HP.WEIGHT.max);
    }
  }

  openUI(namee = "Brain") {
    this.ui = new TabHolder(namee, true, () => {
      this.closeUI()
    });

    this.ui.add(new Label("Neuron config", `[${this.getLayerData().join(", ")}]`))

    this.ui.add(new NEATViewer("Model", this))

    let buttons = new Holder('Buttons')

    buttons.add(new Button("Log", () => {
      console.log(this)
    }))

    // buttons.add(new Button("Process", () => {
    //   let pt = new TabHolder("Process", true, () => {});
    //   let l1 = this.getLayer(0);
    //   let out = this.getLayer(this.layers - 1)

    //   for (let i = 0; i < l1.length; i++) {
    //     pt.add(new Slider(`Input [${i}]`, 0, 1, 0, 0.01, (val) => {
    //       let input = [];
    //       for (let i = 0; i < l1.length; i++) {
    //         input.push(pt[`Input [${i}]`].val || 0)
    //       }
    //       let output = this.process(input).map(x => { return x.toFixed(2) })
    //       for (let o = 0; o < output.length; o++) {
    //         pt[`Output [${o}]`].changeVal(output[o])
    //       }
    //     }))
    //   }
    //   pt.add(new Line())
    //   for (let i = 0; i < out.length; i++) {
    //     pt.add(new Slider(`Output [${i}]`, -1, 1, 0, 0.01))
    //   }
    //   this.ui_processor = pt;
    // }))

    // buttons.add(new Button("Export", () => {
    //   console.log(this.export())
    //   let noti = new TabHolder("Notification")
    //   noti.add(new Label("", "The neural networks information has been logged in the console."))
    //   noti.add(new Button("Ok", () => {
    //     noti.close()
    //   }))
    // }))

    // buttons.add(new Button("Mutate", () => {
    //   this.mutate(0.25)
    // }))

    // buttons.add(new Button("Update UI", () => {
    //   this.updateUI();
    // }))

    buttons.add(new Button("Edit", () => {
      let editor = new TabHolder(`Brain Editor`, true, () => {
        editor.close();
        this.ui_editor = undefined;
      });

      let nodes = new Holder("Nodes")
      for (let i = 0; i < this.nodes.length; i++) {
        let node = this.nodes[i];

        if (node.layer != 0) {
          let holder = new Holder(node.id);
          holder.add(new Label("Layer", node.layer))
          holder.add(new Slider("Bias", NEAT_HP.BIAS.min, NEAT_HP.BIAS.max, node.bias, 0.01, (val) => {
            node.bias = val;
            this.updateUI()
          }))
          nodes.add(holder)
        }
      }

      let connections = new Holder("Connetions")
      for (let i = 0; i < this.connections.length; i++) {
        let connetion = this.connections[i];

        let holder = new Holder(`${connetion.n1} → ${connetion.n2}`);
        holder.add(new Slider("Weight", NEAT_HP.WEIGHT.min, NEAT_HP.WEIGHT.max, connetion.weight, 1, (val) => {
          connetion.weight = val;
          this.updateUI()
        }))

        connections.add(holder)
      }

      editor.add(nodes)
      editor.add(connections)
      editor.setPos(((innerWidth/10)*8), innerHeight/2)

      this.ui_editor = editor;
    }))

    this.ui.add(buttons)
    this.ui.Buttons.collapse();
    this.ui.Buttons.collapse();

    this.ui.setPos(((innerWidth/10)*9.3), innerHeight/2)
  }

  updateUI() {
    if (this.ui) {
      this.ui.Model.update(this);
    }
  }

  closeUI() {
    if (this.ui == undefined) { return }
    this.ui.close();
    this.ui = undefined;

    if (this.ui_processor != undefined) {
      this.ui_processor.close();
      this.ui_processor = undefined;
    }

    if (this.ui_editor != undefined) {
      this.ui_editor.close();
      this.ui_editor = undefined;
    }
  }

  mutate(n) {
    n = clamp(n, 0, 1)
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].mutate(n)
    }
    for (let i = 0; i < this.connections.length; i++) {
      this.connections[i].mutate(n)
    }

    if (this.ui != undefined && this.ui_name != undefined) {
      this.updateUI()
    }
  }

  export() {
    let data = {}

    data.nodes = [];
    data.connections = [];
    data.dna = this.dna;

    for (let i = 0; i < this.nodes.length; i++) {
      data.nodes.push({
        id: this.nodes[i].id,
        bias: this.nodes[i].bias,
        layer: this.nodes[i].layer
      });
    }

    for (let i = 0; i < this.connections.length; i++) {
      data.connections.push({
        n1: this.connections[i].n1,
        n2: this.connections[i].n2,
        weight: this.connections[i].weight
      })
    }

    return JSON.stringify(data);
  }

  copy() {
    let output = new Genome([], false);
    for (let i = 0; i < this.nodes.length; i++) {
      output.nodes.push(this.nodes[i].copy(output))
    }
    for (let i = 0; i < this.connections.length; i++) {
      output.connections.push(this.connections[i].copy())
    }
    output.dna = this.getLayerData();
    output.layers = this.layers;
    output.next_node_id = this.next_node_id;

    return output;
  }

  validate() {
    /*
      Allow for removal and addition
      of neurons inside of a networ
      without unnecessarily removing
      connections.
    */

    // for each connection if either neurons dont exist remove connection
    for (let i = 0; i < this.connections.length; i++) {
      let conn = this.connections[i];
      let n1 = this.getNode(conn.n1);
      let n2 = this.getNode(conn.n2);

      if (n1 == undefined || n2 == undefined) {
        this.connections.splice(i, 1);
        i--;
      }
    }
  }
}

Genome.compare = function(g1, g2) {
  let n = 0;

  for (let i = 0; i < g1.connections.length; i++) {
    let c1 = g1.connections[i];

    var match = false;

    for (let j = 0; j < g2.connections.length; j++) {
      if (g2.connections[j].innovation_id == c1.innovation_id) {
        match = true;
        n += 1 / Math.abs(g2.connections[j].weight - c1.weight)
      }
    }

    if (match == false) {
      n += 1;
    }
  }

  return n

}

Genome.load = function(raw) {
  let data = JSON.parse(raw);

  let genome = new Genome(data.dna, false);

  for (let i = 0; i < data.nodes.length; i++) {
    let n = new Node(data.nodes[i].id, data.nodes[i].layer);
    n.bias = data.nodes[i].bias
    genome.addNode(n)
  }

  for (let i = 0; i < data.connections.length; i++) {
    let c = new Connection(data.connections[i].n1, data.connections[i].n2);
    c.weight = data.connections[i].weight;
    genome.addConnection(c);
  }

  genome.initialized = true;
  genome.layers = data.dna.length;

  return genome;
}