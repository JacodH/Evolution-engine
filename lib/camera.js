class camera2D {
  constructor(zoom) {
    this.zoom = zoom;
    this.az = 0;
    this.dz = 0;

    this.min_zoom = 0.05;
    this.max_zoom = 15;
    
    this.x = 0;
    this.y = 0;
    
    this.dx = 0;
    this.dy = 0;
    
    this.cx = innerWidth/2;
    this.cy = innerHeight/2;
    
    this.mx = 0;
    this.my = 0;
    
    this.pmx = 0;
    this.pmy = 0;
    
    this.speed = 2;
    
    this.controller = "mouse";
  }
  
  update() {
    translate(width/2, height/2)
    scale(this.zoom)
    translate(this.x, this.y)
    
    this.x += this.dx;
    this.y += this.dy;
    
    this.dx *= 0.9;
    this.dy *= 0.9;
    
    this.az *= 0.8;
    this.dz *= 0.5;

    this.dz += this.az;
    this.zoom = clamp(this.zoom+this.dz, this.min_zoom, this.max_zoom);
    
    this.pmx = this.mx;
    this.pmy = this.my;
    
    this.mx = this.camX(mouseX);
    this.my = this.camY(mouseY);
    
    this.cx = this.camX(width/2);
    this.cy = this.camY(height/2);
    
    if (this.controller == "wasd" || this.controller == "both") {
        if (keyIsDown(87)) {
          this.moved(0, -this.speed)
        }
        if (keyIsDown(83)) {
          this.moved(0, this.speed)
        }
        if (keyIsDown(65)) {
          this.moved(-this.speed, 0)
        }
        if (keyIsDown(68)) {
          this.moved(this.speed, 0)
        }
    }
    if (this.controller == "mouse" || this.controller == "both") {
      if (mouseIsPressed && overTab == false) {
       
        this.moved(this.pmx-this.mx, this.pmy-this.my)
       
      }
    }
  }
  
  goto(x, y) {
    this.x = -x
    this.y = -y
  }
  
  move(dx, dy) {
    this.x += -dx;
    this.y += -dy;
  }
  
  moved(dx, dy) {
    this.dx += -dx;
    this.dy += -dy;
  }
  
  camX(x) {
    return -this.x + (x - width/2) / this.zoom;
  }

  camY(y) {
    return -this.y + (y - height/2) / this.zoom;
  }

  scale(factor) {
    this.az += factor;
  }
}