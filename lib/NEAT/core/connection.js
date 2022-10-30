class Connection {
  constructor(n1, n2, weight) {
    this.n1 = n1;
    this.n2 = n2;
    if (weight == undefined) {this.weight = rng(NEAT_HP.WEIGHT.min, NEAT_HP.WEIGHT.max)}
    else {this.weight = weight}
    this.innovation_id = `${n1}-${n2}`
  }

  mutate(n) {
    if (n == 0) { return }
    this.weight = clamp(this.weight + rng(NEAT_HP.WEIGHT.min * n, NEAT_HP.WEIGHT.max * n), NEAT_HP.WEIGHT.min, NEAT_HP.WEIGHT.max)
  }

  copy() {
    let conn = new Connection(this.n1, this.n2);
    conn.weight = this.weight;
    return conn;
  }
}