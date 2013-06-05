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

function handlePresence(msg) {
	console.log("Presence: " + JSON.stringify(msg));
	if (msg.action == "leave") {
		// Remove from member UI list
		$(".member-area p:contains('" + msg.uuid + "')").animate({ marginLeft: "100%" }, function () {
			$(this).remove()
		});
		// Someone is backing out because they tried to use your name. Resubscribe.
		if (msg.uuid == localStorage.chatName) {
			P.subscribe({
				channel: "chat",
				presence: handlePresence,
				callback: handleMessage
			});
		}
	}
	else if (msg.action == "join" && msg.uuid != localStorage.chatName && !$(".member-area p:contains('" + msg.uuid + "')").length) {
		// Add member to UI list
		$(".member-area").append("<p>" + msg.uuid + "</p>");
		$(".member-area p:contains('" + msg.uuid + "')").animate({ marginLeft: "0px" });
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
			var uuid = uuids[i];
			if (uuid == localStorage.chatName) {
				P.unsubscribe({ channel: "chat" });
				delete localStorage.chatName;
				alert("Your name is already in use. Please choose a different one.");
				// Go back to name selection
				$(".main-area").load("./register.html");
				return;
			}
			else if (!$(".member-area p:contains('" + uuid + "')").length) {
				// Add member to UI list
				$(".member-area").append("<p>" + uuid + "</p>");
				$(".member-area p:contains('" + uuid + "')").animate({ marginLeft: "0px" });
			}
		}
		// Remember the name from localStorage
		var uBox = $(".user-box");
		uBox[0].innerHTML = localStorage.chatName;
		uBox.animate({ marginRight: "0px" });
	}
});