var cell_types = ["Mover", "Rotater", "Eye", "Mouth"];
var cell_energy_needed = 0.00033;

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
    "Rotater": {
        "neuron_type": "Output",
        "neurons": ["Angle"],
        "desc": "The Rotater cell rotates at\na neurologically determined angle.",
        "neurons_default": [0],
        "energy_cost": 0.00002,
        "color": [255, 100, 100],
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
        "neurons": ["Angle"],
        "desc": "The Eye cell sends neurological\ndata about the nearest food\npelet and nearest organism is.",
        "neurons_default": [0],
        "energy_cost": 0.00002,
        "color": [79, 87, 204],
        "update": (cell) => {

            let food = engine.foodGrid.getAll(cell.x, cell.y);
            let all = []
            for (let c = 0; c < food.length; c++) {
                all.push(...food[c]);
            }

            // Find nearest object
            let closest = undefined;
            let closestD = Infinity;
            for (let i = 0; i < all.length; i++) {
                let food = all[i];
                let d = dist(food.x, food.y, cell.x, cell.y);

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

            // this code is absolutely disgusting i am soooo sorry
            // im so bad at rotation even in the real world just visualzing it its a struggle

            let pelet = all[closest]
            // cell.neural_vals[0] = closestD/1000;
            let a = getAngleRad(cell, pelet)
            // let a = getAngleRad(cell, {x: cam.mx, y: cam.my})
            // a = Math.abs(a+(Math.PI*1)) % (Math.PI*2)

            // cell.neural_vals[1] = a - cell.a;

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
        "desc": "Eats food it touches.",
        "neurons_default": [],
        "energy_cost": 0.00002,
        "color": [204, 139, 10],
        "update": (cell) => {
            let food = engine.foodGrid.getAll(cell.x, cell.y);
            for (let c = 0; c < food.length; c++) {
                for (let f = 0; f < food[c].length; f++) {
                    if (dist(cell.x, cell.y, food[c][f].x, food[c][f].y) < 28) {
                        food[c].splice(f, 1);
                        engine.foodGrid.length -= 1;
                        cell.org.energy += 0.5;
                        return
                    }
                }
            }
        },
        "render": (cell) => {}
    },
}