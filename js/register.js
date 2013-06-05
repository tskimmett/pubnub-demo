var confirm = $(".confirm-name");
var input = $(".name-input");

confirm.hover(function () {
	confirm.stop();
	confirm.animate({color: "#669999"}, 300);
}, function () {
	confirm.stop();
	confirm.animate({color: "white"}, 300);
});

confirm.click(function() {
	// Move on to the next screen and store the username
	localStorage.chatName = input.val();
	$(".main-area").load("./chat.html");
});

input.on("input", function() {
	if ($(this).val().length > 2) {
		$(".confirm-name-area").animate({height: "28px"}, 300);
		confirm.fadeIn();
	}
	else {
		confirm.fadeOut();
		$(".confirm-name-area").animate({height: "0px"}, 300);
	}
});