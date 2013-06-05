/***
	-Fit chat screen vertically below top bar
	-Fit message area horizontally left of member area
	-Fit messages vertically above input box
 ***/
function onResize() {
	$(".chat-screen").height(window.innerHeight - $(".top-bar").outerHeight());
	var mArea = $(".message-area");
	mArea.width(window.innerWidth - $(".member-area").outerWidth());
	$(".messages").height(mArea.innerHeight() - $(".message-input").outerHeight() - 20);
	var mInput = $(".message-input");
		mInput.width(mArea.innerWidth() * 0.80);
		mInput.css("left", mArea.innerWidth() * 0.10);
};
$(window).resize(onResize);
onResize();

/********************************
 *	PubNub Stuff and Chat Logic *
 ********************************/

var CHANNEL = "chat"

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
				channel: CHANNEL,
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
	var msg = JSON.parse(msg);
	var messages = $(".messages");
	messages.append("<div class='message'><p class='body'>" + msg.text + "</p><p class='source'>" + msg.source + "</p></div>")
	messages.stop();
	messages.animate({ scrollTop: messages[0].scrollHeight }, 500);
};

// Subscribe to presence and messages
P.subscribe({
	channel: CHANNEL,
	presence: handlePresence,
	callback: handleMessage
});

// Get the current room members and check for taken name
P.here_now({
	channel: CHANNEL,
	callback: function (msg) {
		console.log("Here_now: " + JSON.stringify(msg));
		for (var i in msg.uuids) {
			var uuid = msg.uuids[i];
			if (uuid == localStorage.chatName) {
				P.unsubscribe({ channel: "chat" });
				alert("The name '" + localStorage.chatName + "' is already in use. Please choose a different one.");
				delete localStorage.chatName;

				// Go back to name selection
				$(".main-area").load("./register.html");
				return;
			}
			// Prevent duplicate members in the list
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

		P.history({
			channel: CHANNEL,
			limit: 20,
			callback: function (messages) {
				messages[0].forEach(handleMessage);
			}
		});
	}
});

/***
	Pressing enter in the input sends a message
***/
$(".message-input").keyup(function (e) {
	console.log(e);
	if (e.keyCode == 13) {
		var input = $(this);
		var txt = input.val();
		input.val("");
		P.publish({
			channel: CHANNEL,
			message: JSON.stringify({
				text: txt,
				source: localStorage.chatName,
				time: Date.now()
			}),
			callback: function(res) {
				// If the message couldn't be sent, replace the text in the input and show an error message
				if (!res[0]) {
					alert("Unable to send message: " + res[2]);
					input.val(txt);
				}
			}
		});
	}
});