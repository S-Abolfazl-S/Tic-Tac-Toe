document.addEventListener('DOMContentLoaded', e => {
	// initialize game 
	(new MainMenu());
	// ======================== FULL SCREEN ============================== //
	var isFullscreen = false;
	function openFullscreen() {
		document.documentElement.requestFullscreen()
			|| document.documentElement.webkitRequestFullscreen()
			|| document.documentElement.msRequestFullscreen()
			|| document.documentElement.mozRequestFullscreen();
	}

	function closeFullscreen() {
		document.exitFullscreen()
			|| document.webkitExitFullscreen()
			|| document.msExitFullscreen()
			|| document.mozExitFullscreen();
	}

	function toggleFullScreen() {
		if (isFullscreen === false) {
			isFullscreen = true;
			openFullscreen();
		} else {
			isFullscreen = false;
			closeFullscreen();
		}
	}

	document.querySelectorAll(".logo").forEach(item => {
		item.onclick = e => {
			toggleFullScreen();
		};
	});
});


class Sounds {
	static {
		this.audio_pressBtn1 = document.getElementById("press-btn1-audio");
		this.audio_pressBtn1.volume = 1.0;
		this.audio_pressBtn2 = document.getElementById("press-btn3-audio");
		this.audio_pressBtn2.volume = 1.0;
		this.audio_winState = document.getElementById("win-state-audio");
		this.audio_winState.volume = 1.0;
	}
}



class MainMenu {
	constructor() {
		// get pane 
		this.pane = document.querySelector("#main-menu");
		this.pane.style.display = 'flex';
		this.game_c = null;
		// button's 
		this.pick_player_btns = document.querySelectorAll("#pick-player > section>input")
		this.msg_el = document.querySelector("#pick-player > h5");
		this.first_player = 'x';
		this.versus_player_btn = this.pane.querySelector("#vs-player");
		this.versus_cpu_btn = this.pane.querySelector("#vs-cpu");
		// init
		this.init_controllers();
	}

	init_controllers() {
		this.pick_player_btns.forEach(item => {
			item.addEventListener('click', e => {
				Sounds.audio_pressBtn1.play();
				if (item.id === "px") {
					this.msg_el.textContent = "remember : o goes first";
					this.first_player = 'o'
				}
				else {
					this.msg_el.textContent = "remember : x goes first";
					this.first_player = 'x'
				}
			})
		});

		this.versus_cpu_btn.addEventListener('click', e => {
			this.createNewGame(this, this.first_player, 'cpu');
		});

		this.versus_player_btn.addEventListener('click', e => {
			this.createNewGame(this, this.first_player, 'player');
		});
	}

	createNewGame(main_menu, first_player, versus) {
		this.game_c = new GameContainer(main_menu, first_player, versus)
		Sounds.audio_pressBtn2.play();
		this.pane.style.display = 'none';
		this.game_c.pane.style.display = 'flex';
	}

	removeGameContainer() {
		this.game_c = null;
	}

}



class GameContainer {
	constructor(main_menu, first_player, versus) {
		this.main_menu = main_menu;
		this.turn = first_player;
		this.versus = versus;
		this.turnCPU = false;
		this.game = new Game(versus);
		// get page
		this.pane = document.querySelector("#game-c");
		this.pane.style.display = 'flex';
		// button's
		this.reset_btn = this.pane.querySelector(".reset-btn");
		this.button_list = this.pane.querySelectorAll("div.board > div");
		this.scores = this.pane.querySelectorAll(".scores>div>span:last-child");
		// player
		this.turn_pane = this.pane.querySelector(".turn>div");
		this.turn_pane.classList = (first_player == 'x') ? 'cross' : 'circle';
		if (first_player == 'x') {
			this.pane.querySelectorAll(".scores>div>span:first-child")[0].innerHTML = 'x(you)';
			this.pane.querySelectorAll(".scores>div>span:first-child")[2].innerHTML = (versus === 'cpu') ? 'o(cpu)' : 'o(player)';
		} else {
			this.pane.querySelectorAll(".scores>div>span:first-child")[0].innerHTML = (versus === 'cpu') ? 'x(cpu)' : 'x(player)';
			this.pane.querySelectorAll(".scores>div>span:first-child")[2].innerHTML = 'o(you)';
		}
		// init 
		this.init_controllers();
	}

	init_controllers() {
		// 
		this.button_list.forEach(button => {
			button.addEventListener('click', e => {
				if (e.target.children.length == 0) {
					Sounds.audio_pressBtn1.play();
					// ========================= VERSUS PLAYER ============================= //
					if (this.turn === 'o') {
						this.turnCPU = true;
						this.turn = 'x';
						this.turn_pane.classList = 'cross';
						e.target.innerHTML = '<svg viewBox="0 0 100 100"> <defs> <linearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%"> <stop offset="0%" stop-color="#f2b237ff" /> <stop offset="100%" stop-color="#f70" /> </linearGradient> </defs> <circle class="progress" /> </svg>'
						this.game.boxes_o.push(parseInt(e.target.id));
						if (this.game.boxes_o.length > 2) {
							// check boxes clicked for get win 
							if (this.game.check_boxes(this.game.boxes_o)) {
								this.scores[2].innerHTML = parseInt(this.scores[2].innerHTML) + 1;
								setTimeout(() => {
									this.resetGame();
									(new WinStatePane(this.main_menu, this, 'circle'));
								}, 1000)
							}
						}
					} else {
						this.turnCPU = true;
						this.turn = 'o';
						this.turn_pane.classList = 'circle';
						e.target.innerHTML = '<div class="crossline crossline-1"></div> <div class="crossline crossline-2"></div>'
						this.game.boxes_x.push(parseInt(e.target.id));
						if (this.game.boxes_x.length > 2) {
							if (this.game.check_boxes(this.game.boxes_x)) {
								this.scores[0].innerHTML = parseInt(this.scores[0].innerHTML) + 1;
								setTimeout(() => {
									this.resetGame();
									(new WinStatePane(this.main_menu, this, 'cross'));
								}, 1000)
							}
						}
					}
					// ========================= TIE MODE ============================= //
					if (this.game.boxes_o.length + this.game.boxes_x.length === 9) {
						this.resetGame();
						this.scores[1].innerHTML = parseInt(this.scores[1].innerHTML) + 1;
					}
				}
			});
		});

		this.reset_btn.addEventListener('click', e => {
			Sounds.audio_pressBtn2.play();
			const reset_pane = new ResetPane(this, this.main_menu, this.play)
			reset_pane.pane.style.display = 'flex';
		});
	}

	resetGame() {
		this.button_list.forEach(btn => {
			btn.innerHTML = '';
		});
		this.game.reset_boxes_history();
	}

	lockButtons() {
		this.pane.style.filter = 'blur(10px)';
		// blocked button's
		this.reset_btn.style.pointerEvents = 'none';
		this.button_list.forEach(btn => {
			btn.style.pointerEvents = 'none';
		});
	}

	unlockButtons() {
		this.pane.style.filter = 'blur(0)';
		// blocked button's
		this.reset_btn.style.pointerEvents = 'auto';
		this.button_list.forEach(btn => {
			btn.style.pointerEvents = 'auto';
		});
	}

	resetScores() {
		this.scores.forEach(score => {
			score.innerHTML = '00';
		});
	}

}

class ResetPane {
	constructor(game_c, main_menu) {
		this.game_c = game_c;
		this.game_c.pane.style.filter = 'blur(10px)';
		this.main_menu = main_menu;
		this.pane = document.querySelector("#reset-pane");
		// button's
		this.reset_btn = this.pane.querySelector("#reset");
		this.cancel_btn = this.pane.querySelector("#cancel");
		this.home_btn = this.pane.querySelector("#home");
		// init controller
		this.init_controllers();
	}

	init_controllers() {
		// blocked button's
		this.game_c.lockButtons();
		// home button
		this.home_btn.addEventListener('click', e => {
			Sounds.audio_pressBtn2.play();
			// GO HOME PAGE or MAIN MENU 
			this.game_c.pane.style.display = 'none';
			this.game_c.resetGame();
			this.main_menu.removeGameContainer();
			// hide pane and unblock buttons
			this.pane.style.display = 'none';
			this.game_c.pane.style.filter = 'blur(0)';
			this.game_c.unlockButtons();

			// reset scores
			this.game_c.resetScores();

			// reset button
			this.game_c.button_list.forEach(btn => {
				btn.innerHTML = '';
			});

			this.main_menu.pane.style.display = 'flex';


		});

		// reset button
		this.reset_btn.addEventListener('click', e => {
			Sounds.audio_pressBtn2.play();
			this.game_c.resetGame();
			// hide pane and unblock buttons
			this.pane.style.display = 'none';
			this.game_c.unlockButtons();
		});

		// cancel button
		this.cancel_btn.addEventListener('click', e => {
			Sounds.audio_pressBtn2.play();
			this.pane.style.display = 'none';
			// unblock buttons
			this.game_c.unlockButtons();
		});

	}
}

class WinStatePane {
	constructor(main_menu, game_c, winner_icon) {
		this.main_menu = main_menu;
		this.game_c = game_c;
		// container's
		this.pane = document.querySelector("#win-state-pane");
		this.icon = this.pane.querySelector("div:nth-child(2)>div")
		this.icon.classList = winner_icon;
		// button's 
		this.quit_btn = this.pane.querySelector("#quit");
		this.next_round_btn = this.pane.querySelector("#next");
		// init
		this.init_controllers();
	}

	init_controllers() {
		// page setup
		this.pane.style.display = 'flex';
		this.game_c.pane.style.filter = 'blur(10px)';
		this.game_c.lockButtons();
		Sounds.audio_winState.play();

		this.quit_btn.onclick = (e) => {
			Sounds.audio_pressBtn2.play();
			this.game_c.unlockButtons();
			this.pane.style.display = 'none';
			this.game_c.pane.style.display = 'none';
			this.main_menu.pane.style.display = 'flex';
			this.game_c.resetScores();
		};

		this.next_round_btn.onclick = (e) => {
			Sounds.audio_pressBtn2.play();
			this.game_c.unlockButtons();
			this.game_c.resetGame();
			this.pane.style.display = 'none';
		};
	}
}

class Game {
	/*
		box numbers:
		1   2   3
		4   5   6
		7   8   9 
	*/
	constructor(versus = "cpu") {
		this.versus = versus;
		this.boxes_x = [];
		this.boxes_o = [];
		this.modes = [
			// horizontal
			[1, 2, 3],
			[4, 5, 6],
			[7, 8, 9],
			// vertical
			[1, 4, 7],
			[2, 5, 8],
			[3, 6, 9],
			// cross
			[1, 5, 9],
			[3, 5, 7],
		];
	}

	check_boxes(boxes) {
		// this function checking win mode for boxes clicked by player
		return this.modes.reduce((acc, mode) => {
			return acc || mode.every(e => boxes.includes(e));
		}, false);
	}

	reset_boxes_history() {
		this.boxes_x = [];
		this.boxes_o = [];
	}
}