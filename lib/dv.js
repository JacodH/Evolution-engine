function easeInQuad (t, b, c, d) {
    return c * (t /= d) * t + b;
}
function rng(min, max) {
  return Math.random() * (max - min) + min;
}

class dv {
  constructor(val) {
    this.val = val;
    this.dval = val;
    
    this.time = 0;
    this.duration = 1000;
    
    this.oldVal = val;
  }
  
  get() {
    return this.val.toFixed(2)
  }

  onchange() {}
  
  set(newVal) {
    if (newVal == this.val) {return}

    this.oldVal = this.val;
    this.wanted = newVal;
    this.time = 0;
  
    let interval = setInterval(() => {
      this.time += 1;
      
      this.dval = this.val;
      
      this.val = easeInQuad(this.time, this.oldVal, this.wanted-this.oldVal, this.duration)

      this.onchange()
      
      if (this.time+1 > this.duration) {
        // this.val = this.wanted;
        clearInterval(interval);
      }

    }, 1)
    
  }
}