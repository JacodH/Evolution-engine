function pt(x1, y1, x2, y2) { /* pythagoras theorem */
    var a = x1 - x2;
    var b = y1 - y2;

    return Math.sqrt( a*a + b*b );
}

var cell_types = ["Mover", "Rotater", "Eye", "Red Eye", "Mouth"];
// var cell_types = ["Mover", "Rotater", "Eye", "Red Eye"];

var energy_cost = 0.00001;

var cell_type_objects = {
    "Mover": {
        "neuron_type": "Output", // The mover cell takes an ouput
        "neurons": ["Speed"], // the speed it moves at
        "desc": "The Mover cell moves at\na neurologically determined\nspeed at it's specified drection",
        "neurons_default": [0],
        "energy_cost": (cell) => {
            return map(clamp(cell.neural_vals[0], 0, 1), 0, 1, energy_cost, 0.0001, true)
        },
        "color": [0, 100, 255],
        "update": (cell) => {
            cell.move(clamp(cell.neural_vals[0], 0, 1) * 6);
        },
        "render": (cell) => {
            push();
            translate(cell.x, cell.y);
            line(Math.cos(cell.a) * 16, Math.sin(cell.a) * 16, Math.cos(cell.a) * 10, Math.sin(cell.a) * 10)
            pop();
        }
    },
    "Rotater": {
        "neuron_type": "Output",
        "neurons": ["Angle"],
        "desc": "The Rotater cell rotates at\na neurologically determined angle.",
        "neurons_default": [0],
        "energy_cost": (cell) => {
            return map(Math.abs(cell.neural_vals[0]), 0, 2, energy_cost, 0.0001)
        },
        "color": [255, 255, 100],
        "update": (cell) => {
            for (let i = 0; i < cell.org.bones.length; i++) {
                let bone = cell.org.bones[i];
                bone.da += cell.neural_vals[0] / 700
            }
            for (let i = 0; i < cell.org.cells.length; i++) {
                let c = cell.org.cells[i];
                c.da += cell.neural_vals[0] / 700
            }
        },
        "render": (cell) => {
            push();

            translate(cell.x, cell.y);
            let a1 = cell.neural_vals[0];
            let a2 = cell.a;
            
            line(Math.cos(cell.a) * 10, Math.sin(cell.a) * 10, Math.cos(cell.a) * 16, Math.sin(cell.a) * 16)

            line((cos(a1 + a2) * 4), (sin(a1 + a2) * 4), (cos(a1 + a2) * 10), (sin(a1 + a2) * 10));
            pop();
        }
    }, 
    "Eye": {
        "neuron_type": "Input",
        "neurons": ["Angle"],
        "desc": "The Eye cell sends neurological\ndata about the nearest food\npelet is.",
        "neurons_default": [0],
        "energy_cost": (cell) => {
            return energy_cost;
        },
        "color": [79, 87, 204],
        "update": (cell) => {

            let foodCells = []
            foodCells.push(...engine.foodGrid.getAll(cell.x - 300, cell.y))
            foodCells.push(...engine.foodGrid.getAll(cell.x + 300, cell.y))
            foodCells.push(...engine.foodGrid.getAll(cell.x, cell.y))
            foodCells.push(...engine.foodGrid.getAll(cell.x, cell.y - 300))
            foodCells.push(...engine.foodGrid.getAll(cell.x, cell.y + 300))
            let all = []
            for (let c = 0; c < foodCells.length; c++) {
                all.push(...foodCells[c]);
            }

            // Find nearest object
            let closest = undefined;
            let closestD = Infinity;
            for (let i = 0; i < all.length; i++) {
                let food = all[i];
                let d = pt(food.x, food.y, cell.x, cell.y);

                if (d < closestD && d < 1000) {
                    closestD = d;
                    closest = i
                }
            }
            if (closest == undefined) {
                cell.neural_vals[0] = 0;
                return
            }

            function getAngleRad(p1, p2){
                // returns the angle between 2 points in radians
                // p1 = {x: 1, y: 2};
                // p2 = {x: 3, y: 4};
                return Math.atan2(p2.y - p1.y, p2.x - p1.x);
            }

            let pelet = all[closest]
            let a = getAngleRad(cell, pelet)

            let x = Math.cos(a - cell.a);
            let y = Math.sin(a - cell.a);

            cell.neural_vals[0] = Math.atan2(y, x);
        },
        "render": (cell) => {
            push();

            translate(cell.x, cell.y);
            let a1 = cell.neural_vals[0];
            let a2 = cell.a;
            
            line(Math.cos(cell.a) * 10, Math.sin(cell.a) * 10, Math.cos(cell.a) * 16, Math.sin(cell.a) * 16)

            line((cos(a1 + a2) * 4), (sin(a1 + a2) * 4), (cos(a1 + a2) * 10), (sin(a1 + a2) * 10));
            pop();
        }
    },
    "Mouth": {
        "neuron_type": "None",
        "neurons": [],
        "desc": "Eats energy of other organisms it touches.",
        "neurons_default": [],
        "energy_cost": (cell) => {
            if (cell.eating == true) {
                return 0.01;
            }
            return energy_cost;
        },
        "color": [249, 86, 79],
        "update": (cell) => {
            cell.eating = false;
            for (let i = 0; i < engine.organisms.length; i++) {
                let other_org = engine.organisms[i];
                if (other_org.birthdate != cell.org.birthdate) {

                    if (pt(cell.org.x, cell.org.y, other_org.x, other_org.y) < 100) {

                        other_org.energy -= 0.01;
                        cell.org.energy += 0.01;
                        if (other_org.energy < 1) {
                            other_org.health -= 1;
                            cell.org.energy += 0.01;
                        }
                        cell.eating = true;
                    }
                }
            }
        },
        "render": (cell) => {}
    },
    "Red Eye": {
        "neuron_type": "Input",
        "neurons": ["Angle"],
        "desc": "The Red Eye cell sends neurological\ndata about the nearest organism is.",
        "neurons_default": [0],
        "energy_cost": (cell) => {
            return energy_cost;
        },
        "color": [162, 44, 41],
        "update": (cell) => {

            // Find nearest object
            let closest = undefined;
            let closestD = Infinity;
            for (let i = 0; i < engine.organisms.length; i++) {
                let org = engine.organisms[i];

                if (org.birthdate != cell.org.birthdate) {
                    
                    let d = pt(org.x, org.y, cell.x, cell.y);
    
                    if (d < closestD && d < 1000) {
                        closestD = d;
                        closest = i
                    }

                }
            }
            if (closest == undefined) {
                cell.neural_vals[0] = 0;
                return
            }

            function getAngleRad(p1, p2){
                // returns the angle between 2 points in radians
                // p1 = {x: 1, y: 2};
                // p2 = {x: 3, y: 4};
                return Math.atan2(p2.y - p1.y, p2.x - p1.x);
            }

            let organism = engine.organisms[closest]
            let a = getAngleRad(cell, organism)

            let x = Math.cos(a - cell.a);
            let y = Math.sin(a - cell.a);

            cell.neural_vals[0] = Math.atan2(y, x);
        },
        "render": (cell) => {
            push();

            translate(cell.x, cell.y);
            let a1 = cell.neural_vals[0];
            let a2 = cell.a;
            
            line(Math.cos(cell.a) * 10, Math.sin(cell.a) * 10, Math.cos(cell.a) * 16, Math.sin(cell.a) * 16)

            line((cos(a1 + a2) * 4), (sin(a1 + a2) * 4), (cos(a1 + a2) * 10), (sin(a1 + a2) * 10));
            pop();
        }
    },
}