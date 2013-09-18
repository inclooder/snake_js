var snakeInstance = null;
function SnakeGame(canvasElem){
	snakeInstance = this;
	this.canvas = canvasElem;
	this.ctx = this.canvas.getContext("2d");
	this.w = this.canvas.width;
	this.h = this.canvas.height;
	this.cx = this.w/2;
	this.cy = this.h/2;
	this.box_size = 10;
	this.ctx.lineWidth = this.box_size;
	this.rows =  Math.round(this.h/this.box_size);
	this.cols =  Math.round(this.w/this.box_size);
	this.speed = 128;
	this.direction = 'left';
	this.next_step=0.0;
	this.game_state='prepare';
	this.start_pos = {
		x:  Math.round(this.w/2),
		y:  Math.round(this.h/2)
	};
	this.keysDown = {};
	
	this.onKeyDown = function(e){
		snakeInstance.keysDown[e.keyCode] = true;
	};
	
	this.onKeyUp = function(e){
		delete snakeInstance.keysDown[e.keyCode];
	};
	
	
	addEventListener("keydown", this.onKeyDown, false);
	addEventListener("keyup", this.onKeyUp, false);
	
	this.reset = function() {
		this.snake = new Array();
		this.snake.push(this.start_pos);
		this.food_arr = new Array();
		this.points=0;
		this.addFood();
		this.game_state='run';
	};
	
	this.addFood = function(){
		this.food_arr.push({x:Math.floor((Math.random()*this.cols))*this.box_size, y:Math.floor((Math.random()*this.rows))*this.box_size});
	};
	

	this.moving = function(){
		var snake_head = this.snake[0];
		if(40 in this.keysDown){ //UP
			if(this.direction != 'down'){
				this.direction = 'up';
			}
		}
		if(38 in this.keysDown){ //DOWN
			if(this.direction != 'up'){
				this.direction = 'down';
			}
		}
		if(37 in this.keysDown){ //LEFT
			if(this.direction != 'right'){
				this.direction = 'left';
			}
		}
		if(39 in this.keysDown){ //RIGHT
			if(this.direction != 'left'){
				this.direction = 'right';
			}
		}
		this.snake.pop();
		switch(this.direction){
			case 'left':
			this.snake.unshift({x:snake_head.x-this.box_size, y:snake_head.y});
			break;
			case 'right':
			this.snake.unshift({x:snake_head.x+this.box_size, y:snake_head.y});
			break;
			case 'up':
			this.snake.unshift({x:snake_head.x, y:snake_head.y+this.box_size});
			break;
			case 'down':
			this.snake.unshift({x:snake_head.x, y:snake_head.y-this.box_size});
			break;
		}	
	}
	
	
	this.gameover = function() {
		this.game_state='end';
		if(typeof(Storage)!=="undefined"){
			if(localStorage.getItem('highScore') < this.points){
				localStorage.setItem('highScore', parseInt(this.points));
			}			
		}
	}
	
	this.collide = function(){
		var s = this.snake[0];
		var to_del = null;
		
		for (var i = this.food_arr.length-1; i >= 0; i--) {
			var f = this.food_arr[i];
			var xd = s.x-f.x;
			var yd = s.y-f.y;
			var distance = Math.sqrt(xd*xd + yd*yd);
			if(distance < this.box_size){
				this.points+=1;
				this.snake.push(f);
				to_del = i;
				break;
			}
		}
		if(to_del !== null) {
			this.addFood();
			this.food_arr.splice(to_del,1);
		}
		if(s.x > this.w - this.box_size || s.x < 0 || s.y < 0 || s.y > this.h - this.box_size){
			this.gameover();
		}
		
		for(var i=1; i<this.snake.length; i++){
			var part = this.snake[i];
			if(s.x == part.x && s.y == part.y){
				this.gameover();
			}
		}
		
	};
	
	this.update = function(delta) {
		var step = this.speed * delta;
		this.next_step+=step;
		if(this.next_step > 1){
			this.next_step-=1;
			this.moving();
			
		}
		this.collide();
	
		
	};
	
	this.render = function() {
		this.ctx.fillStyle = "#cccccc";
		this.ctx.fillRect(0,0, this.w, this.h);
		for (var i = 0; i < this.snake.length; i++) {
			var s = this.snake[i];
			this.ctx.fillStyle = "#00FF00";
			this.ctx.fillRect(s.x, s.y, this.box_size, this.box_size);
		}
		for (var i = 0; i < this.food_arr.length; i++) {
			var f = this.food_arr[i];
			this.ctx.fillStyle = "#FF0000";
			this.ctx.fillRect(f.x, f.y, this.box_size, this.box_size);
		}
		if(this.game_state == 'end'){
			this.ctx.textAlign = 'center';
			this.ctx.fillStyle    = '#F00';
			this.ctx.font         = 'Bold 50px Sans-Serif';
			this.ctx.textBaseline = 'Top';
			this.ctx.fillText  ('Game Over', this.cx, this.cy);
		}
		this.ctx.fillStyle = "rgba(0,0,0, 0.8)";
		this.ctx.textAlign = 'left';
		this.ctx.font = '15px Arial';
		this.ctx.fillText  ('Points: ' + this.points, 10,20);
		
		if(typeof(Storage)!=="undefined"){
				this.ctx.fillText  ('Highscore: ' + localStorage.getItem('highScore'), 10, this.h- 15);
				
		}
		
	};
	
	this.main = function() {
		var now = Date.now();
		var delta = now - snakeInstance.then;
		if(snakeInstance.game_state == 'run'){
			snakeInstance.update(delta / 10000);
		}
		snakeInstance.render();
		snakeInstance.then = now;
	};
	
	this.start = function() {
	
		this.reset();
		
		this.then = Date.now();
		setInterval(this.main, 100);
	};
}

