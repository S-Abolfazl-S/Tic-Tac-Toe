document.addEventListener('DOMContentLoaded', e => {
	const game = new Game();
});

class MainMenu {
	constructor() {
		MainMenu.pick_player.forEach(item => {
			item.onclick = this.on_click_pick_player;
		});

		MainMenu.versus_cpu_btn.onclick = e => this.new_game('cpu');

		MainMenu.versus_player_btn.onclick = e => this.new_game('player');

		Game.starter = MainMenu.pick_player_msg.innerHTML;
	}

	static {
		this.pane = document.querySelector("#main-menu");
		this.pick_player = this.pane.querySelectorAll("#pick-player>section>input");
		this.pick_player_msg = this.pane.querySelector("#pick-player>h5>span");
		this.versus_player_btn = this.pane.querySelector("#vs-player");
		this.versus_cpu_btn = this.pane.querySelector("#vs-cpu");
	}

	on_click_pick_player(e) {
		Game.audio_1.play();
		Game.turn = (e.target.id === "po") ? "x" : "o";
		MainMenu.pick_player_msg.innerHTML = Game.turn;
	}

	new_game(vs) {
		Game.audio_2.play();
		Game.versus = vs;
		Game.turn = MainMenu.pick_player_msg.innerHTML;
		Game.starter = Game.turn;
		MainMenu.pane.style.display = 'none';
		GamePage.pane.style.display = 'flex';
		GamePage.turn_icon.classList = (Game.turn == 'x') ? "cross" : "circle";
		if (Game.turn == 'x') {
			GamePage.score_list1[0].innerHTML = 'x(you)';
			GamePage.score_list1[2].innerHTML = (Game.versus === 'cpu') ? 'o(cpu)' : 'o(player)';
		} else {
			GamePage.score_list1[0].innerHTML = (Game.versus === 'cpu') ? 'x(cpu)' : 'x(player)';
			GamePage.score_list1[2].innerHTML = 'o(you)';
		}
	}
}

class GamePage {
	constructor() {
		GamePage.button_list.forEach(btn => { btn.addEventListener('click', this.on_click_button); });
		GamePage.reset_btn.addEventListener('click', this.on_click_reset_btn);
	}

	static {
		this.pane = document.querySelector("#game-page");
		this.reset_btn = this.pane.querySelector(".reset-btn");
		this.button_list = this.pane.querySelectorAll("div.board > div");
		this.turn_icon = this.pane.querySelector(".turn>div");
		this.score_list1 = this.pane.querySelectorAll(".scores>div>span:first-child");
		this.score_list2 = this.pane.querySelectorAll(".scores>div>span:last-child");
	}

	static add_shape(button) {
		// add shape and player is won the game or not 
		if (Game.turn === 'x') {
			Game.boxes_x.push(parseInt(button.id));
			button.innerHTML = '<div class="crossline crossline-1"></div> <div class="crossline crossline-2"></div>';
			if (Game.check_boxes(Game.boxes_x)) {
				setTimeout(() => {
					GamePage.score_list2[0].innerHTML = parseInt(GamePage.score_list2[0].innerHTML) + 1;
					Game.shallow_reset();
					WinPane.show({ icon: 'cross' });
				}, 1000);
			}
		} else if (Game.turn === 'o') {
			Game.boxes_o.push(parseInt(button.id));
			button.innerHTML = '<svg viewBox="0 0 100 100"> <defs> <linearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%"> <stop offset="0%" stop-color="#f2b237ff" /> <stop offset="100%" stop-color="#f70" /> </linearGradient> </defs> <circle class="progress" /> </svg>';
			if (Game.check_boxes(Game.boxes_o)) {
				setTimeout(() => {
					GamePage.score_list2[2].innerHTML = parseInt(GamePage.score_list2[2].innerHTML) + 1;
					Game.shallow_reset();
					WinPane.show({ icon: 'circle' });
				}, 1000);
			}
		}
		if (Game.boxes_x.length + Game.boxes_o.length === 9) {
			setTimeout(() => {
				// TIE MODE 
				GamePage.score_list2[1].innerHTML = parseInt(GamePage.score_list2[1].innerHTML) + 1;
				Game.shallow_reset();
				WinPane.show({ icon: 'cross', who: '', msg: 'tie' });
			}, 1000);
		}
	}


	on_click_button(e) {
		if (e.target.children.length === 0) {
			Game.audio_1.play();
			// player 
			if (Game.cpu_state == false) {
				GamePage.add_shape(e.target, 'player');
				Game.cpu_state = (Game.versus === 'cpu') ? true : false;
			}
			// cpu 
			if (Game.cpu_state == true) {
				setTimeout(() => {
					Game.cpu_state = false;
					const empty_boxes = [];
					GamePage.button_list.forEach((btn, index) => {
						if (btn.innerHTML === '') {
							empty_boxes.push(index);
						}
					});
					let index = empty_boxes[Math.floor(Math.random() * empty_boxes.length)];
					const button = GamePage.button_list[index];
					if (button.children.length == 0) {
						Game.audio_1.play();
						GamePage.add_shape(button, 'cpu');
					}
					[Game.turn, GamePage.turn_icon.classList] = (Game.turn === 'x') ? ['o', 'circle'] : ['x', 'cross'];
				}, 1000);
			}
			[Game.turn, GamePage.turn_icon.classList] = (Game.turn === 'x') ? ['o', 'circle'] : ['x', 'cross'];
		}
	}

	on_click_reset_btn(e) {
		GamePage.lock_page();
		Game.audio_2.play();
		ResetPane.pane.style.display = 'flex';
	}

	static lock_page() {
		GamePage.pane.style.filter = 'blur(8px)';
		GamePage.reset_btn.style.pointerEvents = 'none';
		GamePage.button_list.forEach(button => {
			button.style.pointerEvents = 'none';
		});
	}
	static unlock_page() {
		GamePage.pane.style.filter = 'blur(0px)';
		GamePage.reset_btn.style.pointerEvents = 'auto';
		GamePage.button_list.forEach(button => {
			button.style.pointerEvents = 'auto';
		});
	}
}

class ResetPane {
	constructor() {
		ResetPane.cancel_btn.onclick = this.on_click_cancel_btn;
		ResetPane.reset_btn.onclick = this.on_click_reset_btn;
		ResetPane.home_btn.onclick = this.on_click_home_btn;
	}
	static {
		this.pane = document.querySelector("#reset-pane");
		this.cancel_btn = this.pane.querySelector("#cancel");
		this.reset_btn = this.pane.querySelector("#reset");
		this.home_btn = this.pane.querySelector("#home");
	}

	on_click_cancel_btn(e) {
		Game.audio_2.play();
		ResetPane.pane.style.display = 'none';
		GamePage.unlock_page();
	}
	on_click_reset_btn(e) {
		Game.audio_2.play();
		ResetPane.pane.style.display = 'none';
		GamePage.unlock_page();
		[Game.turn, GamePage.turn_icon.classList] = (Game.starter === 'x') ? ['x', 'cross'] : ['o', 'circle'];
		Game.shallow_reset();
	}
	on_click_home_btn(e) {
		Game.audio_2.play();
		ResetPane.pane.style.display = 'none';
		GamePage.unlock_page();
		GamePage.pane.style.display = 'none';
		MainMenu.pane.style.display = 'flex';
		Game.full_reset();
	}

}

class WinPane {
	constructor() {
		WinPane.quit_btn.onclick = this.on_click_quit_btn;
		WinPane.next_round_btn.onclick = this.on_click_next_round_btn;
	}
	static {
		this.pane = document.querySelector("#win-pane");
		this.quit_btn = this.pane.querySelector("#quit");
		this.next_round_btn = this.pane.querySelector("#next");
		this.icon = this.pane.querySelector("div:nth-child(2)>div");
		this.who = document.querySelector("#win-pane>p");
		this.msg = document.querySelector("#win-pane>div>h1");
	}

	static show({ icon = '', who = 'you', msg = 'takes the round' }) {
		Game.audio_3.play();
		GamePage.lock_page();
		WinPane.pane.style.display = 'flex';
		WinPane.icon.classList = icon;
		if (who == '')
			WinPane.who.innerHTML = '';
		else
			WinPane.who.innerHTML = who.replace(/$/, ' won!');
		WinPane.msg.innerHTML = msg;
	}

	on_click_quit_btn(e) {
		Game.audio_2.play();
		WinPane.pane.style.display = 'none';
		GamePage.unlock_page();
		GamePage.pane.style.display = 'none';
		MainMenu.pane.style.display = 'flex';
		Game.full_reset();
	}

	on_click_next_round_btn(e) {
		Game.audio_2.play();
		WinPane.pane.style.display = 'none';
		GamePage.unlock_page();
		Game.shallow_reset();
	}
}


class Game {
	constructor() {
		// setup container's 
		this.main_menu = new MainMenu();
		MainMenu.pane.style.display = 'flex';
		this.game_page = new GamePage();
		this.reset_pane = new ResetPane();
		this.win_pane = new WinPane();


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
	}

	static {
		// game sound's
		this.audio_1 = document.getElementById("audio_1");
		this.audio_2 = document.getElementById("audio_2");
		this.audio_3 = document.getElementById("audio_3");
		// 
		this.versus = null;
		this.turn = null;
		this.starter = null;
		this.cpu_state = false;
		this.win_player_state = false;
		// History of clicked buttons
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

	static check_boxes(boxes) {
		// this function checking win mode for boxes clicked by player
		if (boxes.length > 2)
			return this.modes.reduce((acc, mode) => {
				return acc || mode.every(e => boxes.includes(e));
			}, false);
		else
			return false
	}

	static clear_boxes_history() {
		this.boxes_x = [];
		this.boxes_o = [];
	}

	static shallow_reset() {
		GamePage.button_list.forEach(btn => {
			btn.innerHTML = '';
		});
		Game.clear_boxes_history();
		Game.cpu_state = false;
	}

	static full_reset() {
		Game.shallow_reset();
		GamePage.score_list2.forEach(score => {
			score.innerHTML = '00';
		});
	}
}

