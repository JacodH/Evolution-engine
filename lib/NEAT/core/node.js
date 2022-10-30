class Node {
  constructor(id, layer, genome) {
    this.id = id;
    this.layer = layer;
    if (this.layer != 0) {
      this.bias = rng(NEAT_HP.BIAS.min, NEAT_HP.BIAS.max)
    }
    this.genome = genome;
    this.val = this.bias;
  }

  fire() {
    let connections = this.genome.getConnected(this.id);

    let sum = 0;

    for (let i = 0; i < connections.length; i++) {

      let c = connections[i];

      let n1 = this.genome.getNode(c.n1);

      sum += (n1.val * c.weight)
    }

    // this.val = Math.tanh(sum + this.bias);
    this.val = clamp(sum + this.bias, NEAT_HP.VALUE.min, NEAT_HP.VALUE.max)
  }

  mutate(n) {
    if (n == 0) { return }
    this.bias = clamp(this.bias + rng(NEAT_HP.BIAS.min * n, NEAT_HP.BIAS.max * n), NEAT_HP.BIAS.min, NEAT_HP.BIAS.max)
  }

  copy(genome) {
    let node = new Node(this.id, this.layer, genome);
    node.bias = this.bias;
    node.val = this.val;
    return node
  }

}
