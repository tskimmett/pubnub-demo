var confirm = $(".confirm-name");
confirm.hover(function() {
	confirm.animate({color: "#669999"}, 300);
}, function() {
	confirm.animate({color: "white"}, 300);
});

confirm.click(function() {
	// Move on to the next screen and store the username
	localStorage.chatName = $(".name-input").val();
	$(".main-area").load("./chat.html");
});

var input = $(".name-input");
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