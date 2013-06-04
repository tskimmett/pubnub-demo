var page = "./chat.html";
if (!localStorage.chatName) {
	page = "./register.html";
}
$(".main-area").load(page);
	