class Engine {
    constructor(config) {
        this.config = config

        this.organisms = [];
        for (let i = 0; i < this.config.organisms; i++) {
            let a = Math.random()*(Math.PI*2)
            this.organisms.push(new Organism(this.config.cells, Math.cos(a)*(Math.random()*this.config.radius), Math.sin(a)*(Math.random()*this.config.radius)))
        }

        this.food = [];

        for (let i = 0; i < this.config.starter_food; i++) {
            let a = Math.random()*(Math.PI*2)
            // let d = Math.random()*this.config.radius
            let d = randomGaussian(50, this.config.radius/Math.PI)

            this.addFood(Math.cos(a)*(d), Math.sin(a)*(d))
        }

        this.selected = undefined;

        this.paused = false;
        this.speed = 1;

        this.ticks = 0;
    }

    addFood(x, y, energy) {
        this.food.push(new Food(x, y, 0, 0, energy))
    }

    render() {
        for (let i = 0; i < this.organisms.length; i++) {
            this.organisms[i].render();
        }

        for (let i = 0; i < this.food.length; i++) {
            this.food[i].render();
        }
    }

    update() {
        if (this.paused == true) {return}
        
        if (this.organisms.length <= 1) {
            let a = Math.random()*(Math.PI*2)
            let d = randomGaussian(50, this.config.radius/Math.PI)
            this.organisms.push(new Organism(this.config.cells, Math.cos(a)*(d), Math.sin(a)*(d)))
        }

        for (let s = 0; s < this.speed; s++) {
            this.ticks += 1;
            for (let i = 0; i < this.organisms.length; i++) {
                this.organisms[i].update();
            }

            if (this.ticks % 100 == 0) {
                if (this.food.length < this.config.max_food) {
                    let a = Math.random()*(Math.PI*2)
                    this.addFood(Math.cos(a)*(Math.random()*this.config.radius), Math.sin(a)*(Math.random()*this.config.radius))
                }
            }

            // for (let i = 0; i < this.food.length; i++) {
            //     this.food[i].update();
            // }
        }
    }

    click() {
        if (this.selected == undefined) {

            for (let i = 0; i < this.organisms.length; i++) {
                for (let c = 0; c < this.organisms[i].cells.length; c++) {
                    let cell = this.organisms[i].cells[c];
                    
                    if (dist(cam.mx, cam.my, cell.x, cell.y) < 16) {
                        this.organisms[i].selected = true
                        this.organisms[i].openUI();
                        this.selected = this.organisms[i];
                    }
                }
            }

        }else {
            for (let c = 0; c < this.selected.cells.length; c++) {
                let cell = this.selected.cells[c];
                
                if (dist(cam.mx, cam.my, cell.x, cell.y) < 16) {
                    cell.openUI();
                }
            }
        }
    }
}