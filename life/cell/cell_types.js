// var cell_types = ["Mover", "Plant", "Rotater", "Eye"];
var cell_types = ["Mover", "Rotater", "Eye"];
var cell_energy_needed = 0.00005;

var cell_type_objects = {
    "Mover": {
        "neuron_type": "Output", // The mover cell takes an ouput
        "neurons": ["Speed"], // the speed it moves at
        "desc": "The Mover cell moves at\na neurologically determined\nspeed at it's specified drection",
        "neurons_default": [0],
        "energy_cost": 0.00002,
        "color": [0, 100, 255],
        "update": (cell) => {
            cell.move(Math.abs(cell.neural_vals[0]) * 6);
        },
        "render": (cell) => {
            push();
            translate(cell.x, cell.y);
            line(Math.cos(cell.a) * 16, Math.sin(cell.a) * 16, Math.cos(cell.a) * 10, Math.sin(cell.a) * 10)
            pop();
        }
    },
    // "Plant": {
    //     "neuron_type": "None", // The plant cell takes no neurons
    //     "neurons": [],
    //     "desc": "The Plant cell creates pure energy slowly\n but moves a lot slower.",
    //     "neurons_default": [],
    //     "color": [0, 255, 0],
    //     "update": (cell) => {
    //         cell.org.energy += 0.00002;
    //         cell.friction = 0.8;

    //         if (cell.org.energy > 2.999) {
    //             cell.org.energy -= 0.5;
                
    //             let x = cell.x;
    //             let y = cell.y;

    //             let dx = rng(-10, 10);
    //             let dy = rng(-10, 10);

    //             if (engine.food.length < engine.config.max_food) {
    //                 let a = Math.random()*(Math.PI*2)
    //                 engine.food.push(new Food(cell.x, cell.y, Math.cos(a)*(Math.random()*1), Math.sin(a)*(Math.random()*1)))
    //             }
    //         }
    //     },
    //     "render": (cell) => {

    //     }
    // },
    "Rotater": {
        "neuron_type": "Output",
        "neurons": ["Vec X", "Vec Y"],
        "desc": "The Rotater cell rotates at\na neurologically determined angle.",
        "neurons_default": [0, 0],
        "energy_cost": 0.00002,
        "color": [255, 100, 100],
        "update": (cell) => {
            for (let i = 0; i < cell.org.bones.length; i++) {
                let bone = cell.org.bones[i];
                bone.da += Math.atan2(cell.neural_vals[1], cell.neural_vals[0]) / 750
            }
            for (let i = 0; i < cell.org.cells.length; i++) {
                let c = cell.org.cells[i];
                c.da += Math.atan2(cell.neural_vals[1], cell.neural_vals[0]) / 750
            }
        },
        "render": (cell) => {
            push();

            // stroke()
            let a1 = cell.neural_vals[0];
            let a2 = cell.a;

            translate(cell.x, cell.y);
            line(Math.cos(cell.a) * 16, Math.sin(cell.a) * 16, Math.cos(cell.a) * 10, Math.sin(cell.a) * 10)

            rotate(cell.a)
            line(cell.neural_vals[0] * 8, cell.neural_vals[1] * 8, cell.neural_vals[0] * 5, cell.neural_vals[1] * 5)

            pop();
        }
    }, 
    "Eye": {
        "neuron_type": "Input",
        "neurons": ["Distnace to object", "Vec X", "Vec Y"],
        "desc": "The Eye cell sends neurological\ndata about the nearest food\npelet and nearest organism is.",
        "neurons_default": [0, 0, 0],
        "energy_cost": 0.00002,
        "color": [79, 87, 204],
        "update": (cell) => {
            cell.org.energy -= cell_energy_needed;

            // Find nearest object
            let closest = undefined;
            let closestD = Infinity;
            for (let i = 0; i < engine.food.length; i++) {
                let food = engine.food[i];
                let d = dist(food.x, food.y, cell.x, cell.y);

                if (d < closestD && d < 500) {
                    closestD = d;
                    closest = i
                }
            }
            if (closest == undefined) {
                cell.neural_vals[0] = 0;
                cell.neural_vals[1] = 0;
                return
            }

            function getAngleRad(p1, p2){
                // returns the angle between 2 points in radians
                // p1 = {x: 1, y: 2};
                // p2 = {x: 3, y: 4};
                return Math.atan2(p2.y - p1.y, p2.x - p1.x);
            }

            let food = engine.food[closest]
            cell.neural_vals[0] = closestD/100;
            let a = getAngleRad(cell, food)
            // let a = getAngleRad(cell, {x: cam.mx, y: cam.my})
            // a = Math.abs(a+(Math.PI*1)) % (Math.PI*2)

            // cell.neural_vals[1] = a - cell.a;
            cell.neural_vals[1] = Math.cos(a - cell.a);
            cell.neural_vals[2] = Math.sin(a - cell.a);
        },
        "render": (cell) => {
            // push();

            // translate(cell.x, cell.y);
            // let a1 = cell.neural_vals[1];
            // let a2 = cell.a;

            // line(0, 0, (cos(a1 + a2) * 16), (sin(a1 + a2) * 16));
            // pop();
            
            push();
            translate(cell.x, cell.y);
            line(Math.cos(cell.a) * 10, Math.sin(cell.a) * 10, Math.cos(cell.a) * 13, Math.sin(cell.a) * 13)

            rotate(cell.a)
            line(cell.neural_vals[1] * 8, cell.neural_vals[2] * 8, cell.neural_vals[1] * 5, cell.neural_vals[2] * 5)

            pop();
        }
    }
}