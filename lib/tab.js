// Make the DIV element draggable:
// dragElement(document.getElementById("tab_4"));

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if (result === null)
    result = [];
  return result;
}

class Utils {
  // Calculate the Width in pixels of a Dom element
  static elementWidth(element) {
    return (
      element.clientWidth -
      parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-left")) -
      parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-right"))
    )
  }

  // Calculate the Height in pixels of a Dom element
  static elementHeight(element) {
    return (
      element.clientHeight -
      parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-top")) -
      parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-bottom"))
    )
  }
}

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "_mover")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "_mover").onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();

    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;

    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();

    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function clamp(n, min, max) {
  n = parseFloat(n)
  if (n < min) { return min };
  if (n > max) { return max };
  return n;
}

var tabs = 0;
var overTab = false;

class TabHolder {
  constructor(name, canClose = true, onclose) {
    this.name = name;
    this.ele = document.createElement('div');
    this.ele.addEventListener('mouseenter', () => {
      overTab = true;
    })
    this.ele.addEventListener('mouseleave', () => {
      overTab = false;
    })
    this.ele.className = 'tab_holder'
    this.ele.id = `tab_${tabs}`
    this.hidden = false;

    let mover = document.createElement('div');
    mover.id = `tab_${tabs}_mover`
    mover.className = 'tab_mover'
    mover.innerText = name;
    if (canClose == false) {
      mover.style.setProperty('width', '100%')
    }else {
      this.onclose = onclose;
    }

    let close = document.createElement('div');
    close.className = 'closeBtn';
    close.innerText = "X"
    close.onclick = () => {
      this.ele.remove()
      this.onclose();
      overTab = false;
    }

    this.labels = document.createElement('div');
    this.labels.className = 'labels';

    tabs++;

    if (canClose == true) {
      this.ele.append(mover, close, document.createElement('br'), this.labels);
    } else {
      this.ele.append(mover, document.createElement('br'), this.labels);
    }

    document.body.append(this.ele)

    dragElement(this.ele)

    this.setPos(100, 100)
  }

  setPos(x, y) {
    if (x == "middle") {
      let width = this.ele.offsetWidth;
      let height = this.ele.offsetHeight;

      x = innerWidth / 2;
      y = innerHeight / 2;

      this.ele.style.left = `${x + (width / 2)}px`;
      this.ele.style.top = `${y + (height / 2)}px`;

      return
    }
    let width = this.ele.offsetWidth;
    let height = this.ele.offsetHeight;

    this.ele.style.left = `${x - (width / 2)}px`;
    this.ele.style.top = `${y - (height / 2)}px`;
  }

  add(ele) {
    this[ele.name] = ele;
    this.labels.append(ele.ele);
  }

  close() {
    this.ele.remove()
  }

  hide() {
    this.ele.style.setProperty("display", "none")
    this.hidden = true;
  }

  show() {
    this.ele.style.setProperty("display", "")
    this.hidden = false;
  }

  toggle() {
    this.hidden = !this.hidden;

    this.hidden ? this.show() : this.hide()
  }
}

const TAB_type_colors = {
  "number": "rgba(0, 100, 255)",
  "string": "rgb(13, 147, 96)",
  "boolean": "rgb(177, 99, 216)"
}

class Label {
  constructor(name, startingVal, hover) {
    this.name = name;
    this.ele = document.createElement('div');
    this.ele.classList.add("container")

    if (hover) {
      this.hover = hover;
    }else {
      this.hover = undefined;
    }
    this.ele.title = this.hover;

    this.elementLeft = document.createElement('span');
    this.elementLeft.className = 'label_left'
    this.elementLeft.innerText = this.name;
    if (this.hover) {
      this.elementLeft.classList.add('desc_label_left')
    }

    let dev = document.createElement('hr');
    dev.classList.add("dev");

    this.ele.append(this.elementLeft);
    this.ele.append(dev);
    if (startingVal != undefined) {
      this.val = startingVal;
      this.elementRight = document.createElement('span');
      this.elementRight.className = 'label_right'
      this.elementRight.innerText = startingVal;
      this.elementRight.style.setProperty("color", TAB_type_colors[typeof startingVal])
      this.ele.append(this.elementRight)
    }

  }

  changeVal(val) {
    if (this.val == undefined) { return }
    if (this.val == val) { return }
    this.val = val;
    if (typeof val == "number") {
      this.elementRight.innerText = this.val.toFixed(2);
    } else if (typeof val == "string") {
      this.elementRight.innerText = this.val;
    } else if (typeof val == "boolean") {
      this.elementRight.innerText = this.val.toString();
    }
    this.elementRight.style.setProperty("color", TAB_type_colors[typeof startingVal])
  }
}

class Holder {
  constructor(name, mouseEnter, mouseExit) {
    this.name = name;
    this.ele = document.createElement('div');
    this.ele.className = 'node';

    let title = document.createElement('span');
    title.className = "node_title"
    title.innerText = name;
    this.ele.append(title)

    let toggle = document.createElement('button');
    toggle.innerText = "-"
    toggle.className = 'toggle_node';
    toggle.onmousedown = () => {
      this.collapse();
      this.collapsed ? toggle.innerText = "+" : toggle.innerText = "-"
      this.collapsed ? toggle.style.setProperty('background-color', "rgba(33, 150, 243, 0.5)") : toggle.style.setProperty('background-color', "rgba(244, 133, 129, 0.5)")
    }
    this.ele.append(toggle);

    if (mouseEnter) {
      this.ele.onmouseenter = mouseEnter;
    }
    if (mouseExit) {
      this.ele.onmouseleave = mouseExit;
    }

    this.ele.append(document.createElement('br'))

    this.items = [];

    this.collapsed = false;

    this.collapsed ? toggle.innerText = "+" : toggle.innerText = "-"
    this.collapsed ? toggle.style.setProperty('background-color', "rgba(33, 150, 243, 0.5)") : toggle.style.setProperty('background-color', "rgba(244, 133, 129, 0.5)")
  }

  collapse() {
    this.collapsed = !this.collapsed;

    for (let i = 0; i < this.items.length; i++) {

      let displayMode;

      let displayModeOn = "block";

      this[this.items[i]] instanceof Label || this[this.items[i]] instanceof TabVector ? displayModeOn = "flex" : displayModeOn = "block"

      this.collapsed ? displayMode = 'none' : displayMode = displayModeOn

      this[this.items[i]].ele.style.setProperty('display', displayMode)
    }
  }

  add(ele) {
    this[ele.name] = ele;
    this.items.push(ele.name);
    this.ele.append(ele.ele);
  }

  clear() {
    for (let i = 0; i < this.items.length; i++) {
      let item = this.items[i];
      this[item].ele.remove()
      this.items.splice(i, 1);
      i--;
    }
  }
}

class Button {
  constructor(name, func) {
    this.name = name;
    this.func = func;

    this.ele = document.createElement('button');
    this.ele.onclick = func;
    this.ele.innerText = name;
    this.ele.className = 'node_button'
  }
}

class Break {
  constructor() {
    this.ele = document.createElement('br')
  }
}

class Line {
  constructor() {
    this.ele = document.createElement('hr')
    this.ele.className = "line"
  }
}

class Slider {
  constructor(name, min, max, val, step, onChange) {
    this.name = name;
    this.val = clamp(val, this.min, this.max);
    this.min = min;
    this.max = max;
    this.step = step || 0.01;
    this.onChange = onChange;

    this.slider = document.createElement('input');
    this.slider.type = "range";
    this.slider.min = min;
    this.slider.max = max;
    this.slider.step = step  || 0.01;
    this.slider.value = val;
    this.slider.classList.add("slider");

    if (this.onChange == undefined) {
      this.slider.disabled = true;
      this.slider.className = "sliderRed"
    }

    this.step = step;

    let div = document.createElement('div');
    div.classList.add("container")

    let label = document.createElement('span');
    label.innerText = this.name;
    label.classList.add('label_left')


    let dev = document.createElement('hr');
    dev.classList.add("dev");

    this.elementRight = document.createElement('span');
    this.elementRight.className = 'label_right'
    this.elementRight.innerText = val.toFixed(2);
    this.elementRight.style.setProperty("color", TAB_type_colors[typeof val])

    div.append(label, dev, this.elementRight);

    this.slider.addEventListener("input", () => {
      this.val = clamp(this.slider.value, this.min, this.max);
      this.elementRight.innerText = parseFloat(this.val).toFixed(2)
      this.onChange(this.val);
    })

    this.ele = document.createElement('div');
    this.ele.classList.add("slidecontainer")
    this.ele.append(div, this.slider)
    this.ele.setAttribute("title", `min: ${this.min}\nmax: ${this.max}\nstep: ${step}`)
  }

  changeVal(newVal) {
    if (this.val == newVal) { return }

    this.val = clamp(newVal, this.min, this.max);
    this.slider.value = this.val.toString();
    this.elementRight.innerText = this.val.toFixed(2)
  }

  changeMax(newVal) {
    if (this.max == newVal) {return}

    this.max = newVal;
    this.slider.max = newVal.toString();
    this.ele.setAttribute("title", `min: ${this.min}\nmax: ${this.max}\nstep: ${this.step}`)
  }

  changeMin(newVal) {
    if (this.min == newVal) {return}
    
    this.min = newVal;
    this.slider.min = newVal.toString();
    this.ele.setAttribute("title", `min: ${this.min}\nmax: ${this.max}\nstep: ${this.step}`)
  }
}

class Graph {
  constructor(name, data, min, max) {
    this.name = name;
    this.data = data;

    this.min = min;
    this.max = max;

    this.ele = document.createElement('div');

    let div2 = document.createElement('div');
    div2.classList.add("container");

    let label = document.createElement('span');
    label.className = 'label_left'
    label.innerText = this.name;

    let dev = document.createElement('hr');
    dev.classList.add("dev");

    // let right = document.createElement('span');
    // right.className

    div2.append(label, dev)
    this.ele.append(div2);

    let scriptt = (p, ele = this.ele, _max = this.max, _min = this.min, data = this.data, name = this.name) => {
      let canvas;

      p.setup = function() {
        canvas = p.createCanvas(Utils.elementWidth(ele), 35);
        canvas.class("graph")

        p.background(210)
        p.stroke(0, 0)

        p.stroke(33, 150, 243)
        let max = _max || Math.max(...data)
        let min = _min || Math.min(...data)

        ele.setAttribute("title", `points: ${data.length}\nmin: ${min.toFixed(2)}\nmax: ${max.toFixed(2)}`)

        let dx = p.width / (data.length - 1);

        let px = undefined;
        let py = undefined;

        for (let i = 0; i < data.length; i++) {
          let x = i * dx;
          let y = p.map(data[i], max, min, 0, p.height);

          if (px != undefined) {
            p.line(px, py, x, y)
          }

          px = x;
          py = y;
        }
      };
    }

    this.p5 = new p5(scriptt, this.ele);
  }

  setData(data) {
    this.data = data;

    this.p5.background(210)
    this.p5.stroke(0, 0)

    this.p5.stroke(33, 150, 243)
    let max = this.max || Math.max(...this.data)
    let min = this.min || Math.min(...this.data)

    this.ele.setAttribute("title", `points: ${data.length}\nmin: ${min.toFixed(2)}\nmax: ${max.toFixed(2)}`)

    let dx = this.p5.width / this.data.length;

    let px = undefined;
    let py = undefined;

    for (let i = 0; i < this.data.length; i++) {
      let x = i * dx;
      let y = this.p5.map(this.data[i], max, min, 0, this.p5.height);

      if (px != undefined) {
        this.p5.line(px, py, x, y)
      }

      px = x;
      py = y;
    }
  }
}

class TabVector {
  constructor(name, x, y) {
    this.name = name;

    this.x = x;
    this.y = y;

    this.ele = document.createElement('div');
    this.ele.classList.add("container");

    this.ele.setAttribute("title", `x: ${this.x.toFixed(2)}\ny: ${this.y.toFixed(2)}`)

    let label = document.createElement('span');
    label.innerText = name;
    label.className = "label_left"

    let dev = document.createElement('hr');
    dev.classList.add("dev");

    this.ele.append(label)
    this.ele.append(dev)

    let script = (p, x = this.x, y = this.y, n = name) => {
      let canvas;

      console.log(x, y)

      p.setup = function() {
        canvas = p.createCanvas(35, 35);
        canvas.class("vector")

        p.background(210)

        p.stroke(33, 150, 243)
        p.translate(p.width / 2, p.height / 2)
        p.line(0, 0, x * 100, y * 100)
      };
    }

    this.p5 = new p5(script, this.ele);
  }

  set(x, y) {
    if (x == this.x && y == this.y) { return }

    this.x = x;
    this.y = y;
    this.ele.setAttribute("title", `x: ${this.x.toFixed(2)}\ny: ${this.y.toFixed(2)}`)

    this.p5.push()
    this.p5.background(210)
    this.p5.stroke(33, 150, 243)
    this.p5.line(0, 0, this.x * 100, this.y * 100)
    this.p5.pop()
  }
}

class NEATViewer {
  constructor(name, genome, render_val = false) {
    this.name = name;
    this.genome = genome;

    this.render_val = render_val;

    this.ele = document.createElement('div');
    this.ele.classList.add("container");
    this.ele.style.setProperty("width", "100%")

    let script = (p) => {
      p.setup = function() {
        let canvas = p.createCanvas(202, 201);
        canvas.class("genome")
      };
    }

    this.p5 = new p5(script, this.ele);
    this.p5.canvas.style.visibility = "visible"

    this.ele.addEventListener('click', () => {
      this.render_val = !this.render_val
      this.update(this.genome)
    })
    setTimeout(() => {
      this.update(genome)
    }, 100)
  }

  update(genome = this.genome) {
    this.genome = genome;

    this.p5.background(30, 255)

    this.p5.stroke(33, 150, 243)
    this.p5.fill(0, 0)
    this.p5.stroke(0, 100)
    this.p5.strokeWeight(0.5)

    this.p5.strokeWeight(1);
    this.p5.stroke(0, 255)
    this.p5.textAlign(this.p5.CENTER)
    this.p5.push();
    this.p5.fill(0, 0)
    this.p5.strokeWeight(1)
    if (this.render_val == true) {
      this.p5.text("Rendering values", this.p5.width / 2, this.p5.height / 2)
    } else {
      this.p5.text("Rendering biases", this.p5.width / 2, this.p5.height / 2)
    }
    this.p5.pop();
    // loop by layers

    let positions = {}

    let dx = this.p5.width / genome.layers;
    for (let l = 0; l < genome.layers; l++) {
      this.p5.line((dx * l + (dx / 2)) - 10, 15, ((dx * l) + (dx / 2)) + 10, 15)
      this.p5.push()
      this.p5.strokeWeight(0.75)
      this.p5.stroke(0, 200)
      if (l == 0) {
        this.p5.text(`i`, (dx * l + (dx / 2)), 10)
      } else if (l < genome.layers - 1) {
        this.p5.text(`h${l}`, (dx * l + (dx / 2)), 10)
      } else {
        this.p5.text(`o`, (dx * l + (dx / 2)), 10)
      }
      this.p5.pop()

      let layer = genome.getLayer(l);

      let dy = ((this.p5.height - 10) / layer.length);

      for (let n = 0; n < layer.length; n++) {
        positions[layer[n].id] = { x: (dx * l) + (dx / 2), y: (dy * n) + (dy / 2) + (10), bias: layer[n].bias, layer: layer[n].layer, val: layer[n].val }
      }
    }

    for (let c = 0; c < genome.connections.length; c++) {
      let con = genome.connections[c];
      if (con.weight != 0) {
        this.p5.strokeWeight(this.p5.map(Math.abs(con.weight), 0, NEAT_HP.WEIGHT.max, 1, 3))
        if (con.weight > 0) {
          this.p5.stroke(33, 243, 150)
        } else {
          this.p5.stroke(243, 33, 33)
        }
        this.p5.line(positions[con.n1].x + 12.5, positions[con.n1].y, positions[con.n2].x - 12.5, positions[con.n2].y)
      }
    }
    this.p5.strokeWeight(1)

    for (let i = 0; i < genome.nodes.length; i++) {
      let x = positions[genome.nodes[i].id].x;
      let y = positions[genome.nodes[i].id].y;

      if (this.render_val == false) {
        let alpha = this.p5.map(Math.abs(positions[genome.nodes[i].id].bias), NEAT_HP.BIAS.min, NEAT_HP.BIAS.max, 20, 255)
        if (positions[genome.nodes[i].id].bias > (NEAT_HP.BIAS.min + NEAT_HP.BIAS.max) / 2) {
          this.p5.fill(33, 243, 150, alpha)
        } else {
          this.p5.fill(243, 33, 33, alpha)
        }
        if (positions[genome.nodes[i].id].layer == 0) {
          this.p5.fill(255)
        }

      } else {
        let alpha = this.p5.map(Math.abs(positions[genome.nodes[i].id].val), NEAT_HP.VALUE.min, NEAT_HP.VALUE.max, 0, 255)
        if (positions[genome.nodes[i].id].val > (NEAT_HP.VALUE.min + NEAT_HP.VALUE.max) / 2) {
          this.p5.fill(33, 243, 150, alpha)
        } else {
          this.p5.fill(243, 33, 33, alpha)
        }
      }


      this.p5.stroke(0, 255)

      this.p5.ellipse(x, y, 25, 25);
      this.p5.fill(0, 255);
      this.p5.stroke(0, 0)
      this.p5.text(genome.nodes[i].id, x, y + 6.25)
    }

    let title = "";
    for (let i = 0; i < genome.nodes.length; i++) {
      let n = genome.nodes[i];
      title += `--------${n.id}---------\n`
      title += `Node: ${n.id}\n`;
      title += `Layer: ${n.layer}\n`
      if (n.layer != 0) {
        title += `Bias: ${n.bias.toFixed(3)}\n`
      }
      let connected = genome.getConnected(n.id);
      title += "Connections: \n"
      for (let c = 0; c < connected.length; c++) {
        let conn = connected[c];
        title += `>  from ${conn.n1} to ${conn.n2} weight of ${conn.weight.toFixed(2)} \n`
      }
    }
    title += `------------------\n`
    this.ele.setAttribute("title", title)

  }
}

class Table {
  constructor(name, layout, color_top = true) {
    this.name = name;
    this.layout = layout;

    this.ele = document.createElement('div');
    this.ele.classList.add("container")

    this.table = document.createElement('table')
    this.table.classList.add("tabtable")

    var tr = document.createElement('tr');

    if (color_top == true) {
      tr.classList.add("tabfirsttr")
    } else {
      tr.classList.add("tabtr")
    }

    for (let i = 0; i < this.layout.length; i++) {
      let td = document.createElement('td');
      td.innerText = this.layout[i]
      td.classList.add("tabtd")
      tr.appendChild(td);
    }

    this.table.appendChild(tr);

    this.ele.append(this.table)

  }

  get(row, col) {
    return this.table.rows[row].cells[col].innerText
  }

  set(row, col, val) {
    this.table.rows[row].cells[col].innerText = val;
  }

  addRow(row) {
    var tr = document.createElement('tr');
    tr.classList.add("tabtr")

    for (let i = 0; i < row.length; i++) {
      let td = document.createElement('td');

      td.append(row[i])
      td.classList.add("tabtd")
      tr.appendChild(td);
    }

    this.table.appendChild(tr);
  }

  clear() {
    this.table.innerHTML = "";
  }
}

class Canvas {
  constructor(name, script) {
    if (script == undefined) { return console.error("Script needed") }

    this.ele = document.createElement('div');

    this.name = name;
    let title = new Label(this.name, "").ele
    this.ele.append(title)
    this.p5 = new p5(script, this.ele);
  }
}