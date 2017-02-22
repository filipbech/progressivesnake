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

	detectColision(newHead) {
		const selfColision = this.isInSnake(newHead);

		if(selfColision) {
			alert('you died by hitting yourself');
			return true;
		}

		const wallColisition = newHead.row < 0 || newHead.row > this.rows.length-1 || newHead.col < 0 || newHead.col > this.rows[0].length-1;

		if(wallColisition) {
			alert('you died by hitting the wall');
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
		this.rows[this.food.row][this.food.col].classList.remove('food');
		this.score++;

		if (this.score % this.nextLevel === 0) {
			this.speed = this.speed*0.8;
		}

		this.updateScore();
		this.generateNewFood();
	}

	generateNewFood() {
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

	setDirection(event) {
		if (event.which === 38) {
			this.direction = 'up';
		}
		if (event.which === 37) {
			this.direction = 'left';
		}
		if (event.which === 40) {
			this.direction = 'down';
		}
		if (event.which === 39) {
			this.direction = 'right';
		}
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

	constructor(numberOfRows, numberOfCols) {
		this.nextLevel = 10;
		this.speed = 150; //frame-duration
		this.container = document.getElementById('game');
		this.setupTiles(numberOfRows, numberOfCols);
		this.direction = 'right';
		this.score = 0;
		this.scoreBoard = document.createElement('div');
		this.scoreBoard.className = 'scoreboard';
		this.container.appendChild(this.scoreBoard);
		
		this.buildSnake(3);

		window.addEventListener('keyup', this.setDirection.bind(this));
		this.generateNewFood();

		//start game by making the first frane
		this.calculateFrame();
	}
}

const game = new Game(30,30);