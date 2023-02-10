// ==UserScript==
// @name            so-quick-comment-flags
// @author          VLAZ
// @description     userscript that allows one-click flagging for comments
// @grant           none
// @inject-into     page
// @match           https://stackoverflow.com/questions/*
// @match           https://serverfault.com/questions/*
// @match           https://superuser.com/questions/*
// @match           https://*.stackexchange.com/questions/*
// @match           https://askubuntu.com/questions/*
// @match           https://stackapps.com/questions/*
// @match           https://mathoverflow.net/questions/*
// @match           https://pt.stackoverflow.com/questions/*
// @match           https://ja.stackoverflow.com/questions/*
// @match           https://ru.stackoverflow.com/questions/*
// @match           https://es.stackoverflow.com/questions/*
// @match           https://meta.stackoverflow.com/questions/*
// @match           https://meta.serverfault.com/questions/*
// @match           https://meta.superuser.com/questions/*
// @match           https://meta.askubuntu.com/questions/*
// @match           https://meta.mathoverflow.net/questions/*
// @match           https://pt.meta.stackoverflow.com/questions/*
// @match           https://ja.meta.stackoverflow.com/questions/*
// @match           https://ru.meta.stackoverflow.com/questions/*
// @match           https://es.meta.stackoverflow.com/questions/*
// @namespace       https://github.com/PurpleMagick/
// @run-at          document-end
// @version         0.0.1
// ==/UserScript==

let __webpack_exports__ = {};

// CONCATENATED MODULE: ./src/attachListener.ts
const isResponse = (obj) => typeof obj === "object"
    && obj !== null
    && "ok" in obj
    && "status" in obj
    && "statusText" in obj;
function doFlag(commentId, flagTypeId) {
	const data = new URLSearchParams({ fkey: StackExchange.options.user.fkey, otherText: "", overrideWarning: "true" });
	return fetch(`/flags/comments/${commentId}/add/${flagTypeId}`, {
		method: "POST",
		credentials: "same-origin",
		body: data
	})
		.then(res => res.ok ? res.json() : Promise.reject(res));
}
function flagTask(commentId, flagType, comment) {
	return async () => {
		const commentFlag = comment.querySelector(".js-comment-flag");
		if (!commentFlag)
			throw Error("could not find the comment flag button with selector [.js-comment-flag]. An update might have broken the userscript");
		commentFlag.classList.remove("fc-black-300");
		commentFlag.classList.remove("o40");
		commentFlag.classList.add("fc-yellow-500");
		commentFlag.classList.add("o90");
		try {
			const result = await doFlag(commentId, flagType);
			if (result.Success) {
				// if (result.ResultChangedState) { // flag caused a deletion
				//TODO smarter remove? Too avoid jumping around? Consider debounce with a hover listener over this block of comments
				//TODO mark it for removal?
				// comment.remove();
				// } else {
				commentFlag.classList.remove("fc-yellow-500");
				commentFlag.classList.add("fc-red-500");
				// }
				return "success";
			}
			// {"Success":false,"Message":"Daily comment flag limit reached; please try again in 1 hour","ResultChangedState":false,"Outcome":2}
			// {"Success":false,"Message":"This comment is deleted and cannot be flagged","ResultChangedState":false,"Outcome":2}
			//TODO handle result.Success === false
			StackExchange.helpers.showToast("Sending flag was not successful. Check console and network tab", { type: "warning", transientTimeout: 30000 });
			console.warn("quick flag response indicated it was not successful. Full data:", result);
			return "failure"; //TODO unknown failure??
		} catch (error) {
			if (isResponse(error)) {
				const body = await error.text();
				const { status, statusText } = error;
				if (status === 409)
					return "retry";
				//TODO catch and handle 409 - Conflict. Add to queue and retry sending;
				StackExchange.helpers.showToast(`Quick comment flag unsuccessful: ${body}`, { type: "danger", transientTimeout: 20000 });
				console.error(`Quick comment flag unsuccessful: code: [${status}] statusText: [${statusText}] body: [${body}]`);
				return "failure";
			}
			console.error("Unexpected error when flagging. Check for a network error", error);
			return "failure";
		}
	};
}
const queue = [];
async function handleQueue(queue) {
	const [nextTask] = queue;
	if (!nextTask)
		return;
	console.log("handling task");
	const result = await nextTask();
	console.log("result:", result);
	switch (result) {
		case "success":
			//StackExchange.helpers.showToast("Flag sent", { type: "success", transientTimeout: 5000 });
			queue.shift();
			break;
		case "failure":
			//boo
			queue.shift();
			//TODO add more handling on failure?
			break;
		case "retry":
			//do nothing
			break;
		default:
        //shouldn't be going here. Probably an error condition
	}
}
const attachListener = () => {
	document.body.addEventListener("click", async function(event) {
		if (!(event.target instanceof HTMLElement))
			return;
		if (!event.target || !event.target.matches("[data-quick-flag]"))
			return;
		event.preventDefault();
		const comment = event.target.closest("li.comment.js-comment");
		if (!comment)
			throw Error("Could not find the main comment element using selector [li.comment.js-comment]. An update might have broken the userscript");
		const commentId = comment.dataset.commentId;
		const flagType = event.target.dataset.quickFlag;
		if (commentId === undefined)
			throw Error("data-comment-id missing from the comment element. An update might have broken the userscript");
		if (flagType === undefined)
			throw Error("data-qiock-flag is missing from the comment element. This should not happen - it is a bug in the script. The data-* attribute should be added");
		const commentFlag = comment.querySelector(".js-comment-flag");
		if (!commentFlag)
			throw Error("could not find the comment flag button with selector [.js-comment-flag]. An update might have broken the userscript");
		commentFlag.classList.remove("fc-black-300");
		commentFlag.classList.remove("o40");
		commentFlag.classList.add("fc-yellow-500");
		commentFlag.classList.add("o90");
		const task = flagTask(commentId, Number(flagType), comment);
		queue.push(task); //TODO make a function. Either process task now if queue is empty or enqueue it
	});
	setInterval(handleQueue, 1000, queue);
};

// CONCATENATED MODULE: ./src/flags.ts
function makeFlag({ text, tooltip, flagId }) {
	const link = document.createElement("a");
	link.href = "#";
	link.textContent = `(${text})`;
	link.title = tooltip;
	link.dataset.quickFlag = String(flagId);
	return link;
}
const flags = {
	get Rude() {
		return makeFlag({ text: "Rude", tooltip: "Rude or offensive", flagId: 20 /* FlagType.RudeOrOffensive */ });
	},
	get Unfriendly() {
		return makeFlag({ text: "U/U", tooltip: "Unfriendly or unkind", flagId: 40 /* FlagType.UnfriendlyOrUnkind */ });
	},
	get NLN() {
		return makeFlag({ text: "NLN", tooltip: "No Longer Needed", flagId: 39 /* FlagType.NoLongerNeeded */ });
	},
};

// CONCATENATED MODULE: ./src/addFlags.ts

function addQuickFlags(comment) {
	const quickFlags = document.createElement("span");
	quickFlags.classList.add("quick-commend-flag-links");
	quickFlags.append(flags.NLN, " ", flags.Unfriendly, " ", flags.Rude);
	comment.classList.add("quick-comment-flags");
	comment.querySelector(".comment-date")
		?.parentElement
		?.append(quickFlags);
}
function main() {
	const allComments = document.querySelectorAll("li.comment:not(.quick-comment-flags)");
	for (const comment of allComments)
		addQuickFlags(comment);
}

// CONCATENATED MODULE: ./src/index.ts


$(document).ajaxComplete(main);
main();
attachListener();

