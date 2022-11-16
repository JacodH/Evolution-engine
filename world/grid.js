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

        this.length = 0;
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
        this.length += 1;
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

/**
 * API
 * newObj(pos, dimension)
 * UpdateObj(obj)
 * FindNear(location, bounds)
 * RemoveObj(obj)
 */

class SpatialHashGrid {
    constructor(bounds, dimension) {
        this._bounds = bounds; // [[-1000, -1000], [1000, 1000]] min and max of area 
        this._dimensions = dimension;// [100, 100]
        this._cells = new Map();
    }

    NewObj(position, dimension) {
        const obj = {
            position: position,
            dimension: dimension,
            indinces: null
        }

        this._Insert(obj);

        return obj;
    }

    _Insert(obj) {
        const [x, y] = obj.position;
        const [w, h] = obj.dimension;

        const il = this._GetCellIndex([x - w / 2, y - h /2])
        const i2 = this._GetCellIndex([x + w / 2, y + h /2])
    
        obj.indinces = [il, i2];

        for (let x = il[0], xn = i2[0]; x <= xn; ++x) {
            for (let y = il[1], yn = i2[1]; y <= yn; ++y) {
                const k = this._Key(x, y);

                if (!(k in this._cells)) {
                    this._cells[k] = new Set();
                }

                this._cells[k].add(obj)
            }
        }
    }

    _Key(x, y) {
        return x + '.' + y
    }

    _GetCellIndex(pos) {
        const x = clamp((pos[0] - this._bounds[0]) / (this._bounds[1][0] - this._bounds[0][0]), 0, 1)
        const y = clamp((pos[1] - this._bounds[1]) / (this._bounds[1][1] - this._bounds[0][0]), 0, 1)

        const xIndex = Math.floor(x * (this._dimensions[0] - 1));
        const yIndex = Math.floor(y * (this._dimensions[1] - 1));
    
        return [xIndex, yIndex];
    }

    FindNear(position, bounds) {
        const [x, y] = position;
        const [w, h] = bounds;

        const il = this._GetCellIndex([x - w / 2, y - h /2])
        const i2 = this._GetCellIndex([x + w / 2, y + h /2])
    
        const objs = new Set();

        for (let x = il[0], xn = i2[0]; x <= xn; ++x) {
            for (let y = il[1], yn = i2[1]; y <= yn; ++y) {
                const k = this._Key(x, y);

                if (k in this._cells) {
                    for (let v of this._cells[k]) {
                        objs.add(v);
                    }
                }
            }
        }

        return objs;
    }

    UpdateObj(obj){
        this.RemoveObj(obj);
        this._Insert(obj);
    }

    RemoveObj(obj) {

        const [il, i2] = obj.indinces;

        for (let x = il[0], xn = i2[0]; x <= xn; ++x) {
            for (let y = il[1], yn = i2[1]; y <= yn; ++y) {
                const k = this._Key(x, y);

                this._cells[k].delete(obj);
            }
        }
    }
}