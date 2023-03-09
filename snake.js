class Game {
	createAndAppendElement() {
		let ele = document.createElement('div');
		ele.className = 'tile';
		this.container.appendChild(ele);
		return ele;
	}

	setupTiles(rows, cols) {
		this.rows = [];
		for (let row=0;row<rows;row++) {
			let columns = [];
			this.rows.push(columns);
			for (let col=0;col<cols;col++) {
				columns.push(this.createAndAppendElement());
			}
		}
	}


	isInSnake(newHead) {
		return !!this.snake.filter(dot => {
			return dot.row == newHead.row && dot.col == newHead.col;
		}).length;
	}

	die(reason) {
		this.gameover.style.display = 'flex';
		this.button.focus();
		this.reason.innerHTML = reason;
	}

	detectColision(newHead) {
		const selfColision = this.isInSnake(newHead);

		if(selfColision) {
			this.die('you died by hitting yourself');
			return true;
		}

		const wallColisition = newHead.row < 0 || newHead.row > this.rows.length-1 || newHead.col < 0 || newHead.col > this.rows[0].length-1;

		if(wallColisition) {
			this.die('you died by hitting a wall');
			return true;
		}
	}

	calculateFrame() {
		const head = this.snake[this.snake.length-1];

		const newHead = {
			row: (this.direction == 'up' ? head.row - 1 : (this.direction == 'down' ? head.row + 1 : head.row)),
			col: (this.direction == 'left' ? head.col - 1 : (this.direction == 'right' ? head.col + 1 : head.col))
		};

		if (this.detectColision(newHead)) {
			return;
		}

		this.snake.push(newHead);

		this.snake.forEach(dot => {
			this.rows[dot.row][dot.col].classList.add('snake');
		});


		setTimeout(this.calculateFrame.bind(this), this.speed);

		if(newHead.row == this.food.row && newHead.col == this.food.col) {
			this.eatFood();
			return;
		}

		const end = this.snake[0];
		this.rows[end.row][end.col].classList.remove('snake');
		this.snake.shift();

	}

	updateScore() {
		this.scoreBoard.innerHTML = this.score;
	}

	eatFood() {
		this.score++;

		if (this.score % this.nextLevel === 0) {
			this.speed = this.speed*0.8;
		}

		this.updateScore();
		this.generateNewFood();
	}

	generateNewFood() {
		if(this.food) {
			this.rows[this.food.row][this.food.col].classList.remove('food');
		}
		let newFood = this.getRandomPosition();

		while (this.isInSnake(newFood)) {
			newFood = this.getRandomPosition();
		}

		this.rows[newFood.row][newFood.col].classList.add('food');
		this.food = newFood;
	}


	getRandomPosition() {
		return {
			row: Math.floor(Math.random()*this.rows.length),
			col: Math.floor(Math.random()*this.rows[0].length)
		};
	}
	handleKeyup(event) {
		if (event.which === 38) {
			this.setDirection('up');
		}
		if (event.which === 37) {
			this.setDirection('left');
		}
		if (event.which === 40) {
			this.setDirection('down');
		}
		if (event.which === 39) {
			this.setDirection('right');
		}
	}

	setDirection(direction) {
		if((this.direction === "left" && direction === "right") ||
		(this.direction === "right" && direction === "left") ||
		(this.direction === "up" && direction === "down") ||
		(this.direction === "down" && direction === "up")) {
			return;
		}
		this.direction = direction;
	}

	buildSnake(startLength) {
		this.snake = [{ 
			row: Math.ceil(this.rows.length/2),
			col: Math.ceil(this.rows[0].length/2)
		}];

		for (var i=0;i<startLength-1;i++) {
			const head = this.snake[0];
			this.snake.unshift({
				row: (this.direction == 'up' ? head.row + 1 : (this.direction == 'down' ? head.row - 1 : head.row)),
				col: (this.direction == 'left' ? head.col + 1 : (this.direction == 'right' ? head.col - 1 : head.col))
			});
		}
	}

	reStart() {
		this.gameover.style.display = 'none';
		this.rows.forEach(row => {
			row.forEach(col=> {
				col.classList.remove('snake');
			})
		});

		this.startGame();
	}


	startGame() {
		this.speed = this.originalSpeed;
		this.setDirection('right');
		this.score = 0;
		this.updateScore();

		this.buildSnake(3);
		this.generateNewFood();
		this.calculateFrame();
	}


	listenForTouch(ev) {
		const first = {x:ev.touches[0].clientX, y:ev.touches[0].clientY};

		const end = function end(ev) {
			const last = {x:ev.changedTouches[0].clientX, y:ev.changedTouches[0].clientY};

			if(Math.abs(first.x-last.x)>Math.abs(first.y-last.y)) {
				if (first.x > last.x) {
					this.setDirection('left');
				} else {
					this.setDirection('right');
				}
			} else {
				if (first.y > last.y) {
					this.setDirection('up');
				} else {
					this.setDirection('down');
				}
			}

			window.removeEventListener('touchend', end);
		}.bind(this);
		window.addEventListener('touchend', end);

	}

	constructor(numberOfRows, numberOfCols) {
		this.nextLevel = 10;
		this.originalSpeed = 150; //frame-duration
		this.container = document.getElementById('game');
		this.gameover = this.container.querySelector('.game-over');
		this.reason = this.gameover.querySelector('#reason');
		this.button = this.gameover.querySelector('#play-again');
		this.button.addEventListener('click', this.reStart.bind(this));

		this.setupTiles(numberOfRows, numberOfCols);
		this.scoreBoard = document.createElement('div');
		this.scoreBoard.className = 'scoreboard';
		this.container.appendChild(this.scoreBoard);
		this.handleKeyup = this.handleKeyup.bind(this);
		
		window.addEventListener('keyup', this.handleKeyup);


		window.addEventListener('touchstart', this.listenForTouch.bind(this));

		this.startGame();
	}
}

const thegame = new Game(30,30);


// Disabling double tab to zoom on iOS
// 
// http://stackoverflow.com/questions/39390817/zoom-issue-in-iphone-for-ios-10

if(navigator.userAgent.match(/iPhone|iPad/)>-1) {
	var mylatesttap = new Date().getTime();
	document.body.addEventListener('touchstart', event => {
		var now = new Date().getTime();
		var timesince = now - mylatesttap;
		if((timesince < 500) && (timesince > 0)){
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
		}
		mylatesttap = new Date().getTime();
	});
}

