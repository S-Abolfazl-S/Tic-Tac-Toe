
document.addEventListener('DOMContentLoaded', e => {
	// button's on game-c
	const board_buttons = document.querySelectorAll(".board>div");
	const menu_btn = document.querySelector(".menu-btn");
	// audio's
	let audio_board_btn = document.getElementById("board-btn");
	audio_board_btn.volume = 1.0;
	let audio_menu_btn = document.getElementById("menu-btn");
	audio_menu_btn.volume = 1.0;

	// =========================  add sound on button's ============================= // 
	board_buttons.forEach((e) => {
		e.addEventListener("click", (e) => {
			audio_board_btn.play();
		});
	});

	menu_btn.addEventListener("click", (e) => {
		audio_menu_btn.play();
	});
	// =========================  /add sound on button's ============================= // 
})