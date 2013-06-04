// Fill window below the top bar with the chat screen
function onResize() {
	$(".chat-screen").height(window.innerHeight - $(".top-bar").height());
};
$(window).resize(onResize);
onResize();

/***
	PubNub Stuff and Chat Logic
 ***/

// Initialize PubNub
var P = PUBNUB.init({
	publish_key: 'pub-c-b2d901ee-2a0f-4d89-8cd3-63039aa6dd90',
	subscribe_key: 'sub-c-c74c7cd8-cc8b-11e2-a2ac-02ee2ddab7fe',
	uuid: localStorage.chatName
});

var members = {};
var messages = [];

function handlePresence(msg) {
	console.log("Presence: " + JSON.stringify(msg));
	if (msg.action == "leave") {
		// Remove from member UI list
		delete members[msg.uuid];
		// Someone is backing out because they tried to use your name. Resubscribe.
		if (msg.uuid == localStorage.chatName) {
			P.subscribe({
				channel: "chat",
				presence: handlePresence,
				callback: handleMessage
			});
		}
	}
	else if (msg.action == "join") {
		delete msg.occupancy;
		members[msg.uuid] = msg;
		// Add member to UI list
	}
};

function handleMessage(msg) {
	console.log(JSON.stringify(msg));
};

// Subscribe to presence
P.subscribe({
	channel: "chat",
	presence: handlePresence,
	callback: handleMessage
});

// Get the current room members and check for taken name
P.here_now({
	channel: "chat",
	callback: function (msg) {
		console.log("Here_now: " + JSON.stringify(msg));
		var uuids = msg.uuids;
		for (var i = 0; i < uuids.length; i++) {
			if (uuids[i] == localStorage.chatName) {
				P.unsubscribe({ channel: "chat" });
				delete localStorage.chatName;
				alert("Chat name in use");
				// Go back to name selection
				$(".main-area").load("./register.html");
				return;
			}
		}
		// Remember the name from localStorage
		var uBox = $(".user-box");
		uBox[0].innerText = localStorage.chatName;
		uBox.animate({ marginRight: "0px" });
	}
});