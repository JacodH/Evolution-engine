function nArray(n) {
    let out = [];
    for (let i = 0; i < n; i++) {
        out.push([]);
    }
    return out;
}

class FoodGrid {
    constructor(n) {
        this.cz = 100;
        this.n = n;
        this.grid = nArray(this.n * this.n);
        this.height = n*this.cz;
        this.width = n*this.cz;
        this.debug = false;
    }

    get length() {
        let sum = 0;
        for (let i = 0; i < this.grid.length; i++) {
            sum += this.grid[i].length;
        }
        return sum;
    }

    renderGrid() {
        if (this.debug == true) {
            push()
            stroke(255, 255);
            for (let x = -(this.cz*this.n)/2; x < (this.cz*this.n)/2; x+=this.cz) {
                for (let y = -(this.cz*this.n)/2; y < (this.cz*this.n)/2; y+=this.cz) {
                    fill(0, 0, 0, 0);
                    
                    if (this.getCell(x, y).length > 0) {
                        fill(255, 255, 0, 100);
                    }
    
                    rect(x, y, this.cz, this.cz);
                }
            }
            pop();
        }
        for(let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                this.grid[i][j].render();
            }
        }
    }

    addFood(food) {
        let cell = this.getCell(food.x, food.y);
        cell.push(food);
    }

    getAll(x, y) {
        let all = [];
        all.push(this.getCell(x-this.cz, y-this.cz)) 
        /*
            #--
            ---
            ---
        */
        all.push(this.getCell(x, y-this.cz))
        /*
            -#-
            ---
            ---
        */
        all.push(this.getCell(x+this.cz, y-this.cz))
        /*
            --#
            ---
            ---
        */
        all.push(this.getCell(x-this.cz, y))
        /*
            ---
            #--
            ---
        */
        all.push(this.getCell(x, y))
        /*
            ---
            -#-
            ---
        */
        all.push(this.getCell(x+this.cz, y))
        /*
            ---
            --#
            ---
        */
        all.push(this.getCell(x-this.cz, y+this.cz))
        /*
            ---
            ---
            #--
        */
        all.push(this.getCell(x, y+this.cz))
        /*
            ---
            ---
            -#-
        */
        all.push(this.getCell(x+this.cz, y+this.cz))
        /*
            ---
            ---
            --#
        */
        return all;
    }

    getCell(x, y) {
        x += (this.cz*this.n)/2
        y += (this.cz*this.n)/2

        let xi = Math.floor(x / this.cz);
        let yi = Math.floor(y / this.cz);

        let i = xi * this.n + yi

        return this.grid[clamp(i, 0, this.grid.length-1)]
    }
}