function onResize() {
	console.log(window.innerHeight);
	console.log($(".top-bar").height());
	$(".member-area").height(window.innerHeight - $(".top-bar").height());
	console.log($(".member-area").height());
};

$(window).resize(onResize);

onResize();

var uBox = $(".user-box");
uBox[0].innerText = localStorage.chatName;
uBox.animate({marginRight: "0px"});