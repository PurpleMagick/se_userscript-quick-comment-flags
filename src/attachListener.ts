import { FlagType, CommentFlagResponse } from "@types";

const isResponse = (obj: unknown): obj is Response =>
	typeof obj === "object"
		&& obj !== null
		&& "ok" in obj
		&& "status" in obj
		&& "statusText" in obj;

function doFlag(commentId: string, flagTypeId: FlagType): Promise<CommentFlagResponse> {
	/*
	const formData = new FormData();

	formData.append("fkey", StackExchange.options.user.fkey);
	formData.append("otherText", "");
	formData.append("overrideWarning", "true");
	*/
	const data = new URLSearchParams({fkey: StackExchange.options.user.fkey, otherText: "", overrideWarning: "true"});
	return fetch(`/flags/comments/${commentId}/add/${flagTypeId}`, {
		method: "POST",
		credentials: "same-origin",
		body: data
	})
		.then(res => res.ok ? res.json() : Promise.reject(res));
}


export const attachListener = () =>
	document.body.addEventListener("click", async function(event: MouseEvent) {
		if (!(event.target instanceof HTMLElement))
			return;

		if (!event.target || !event.target.matches("[data-quick-flag]")) return;

		event.preventDefault();

		const comment = event.target.closest<HTMLLIElement>("li.comment.js-comment");
		if (!comment)
			throw Error("Could not find the main comment element using selector [li.comment.js-comment]. An update might have broken the userscript");

		const commentId = comment.dataset.commentId;
		const flagType = event.target.dataset.quickFlag;

		if (commentId === undefined)
			throw Error("data-comment-id missing from the comment element. An update might have broken the userscript");

		if (flagType === undefined)
			throw Error("data-qiock-flag is missing from the comment element. This should not happen - it is a bug in the script. The data-* attribute should be added");

		try {
			const result = await doFlag(commentId, Number(flagType) as FlagType);
			if (result.Success) {
				StackExchange.helpers.showToast("Flag sent", { type: "success", transientTimeout: 3000 });
				if (result.ResultChangedState) { // flag caused a deletion
					comment.remove();
				} else {
					const commentFlag = comment.querySelector(".js-comment-flag");
					if (!commentFlag)
						throw Error("could not find the comment flag button with selector [.js-comment-flag]. An update might have broken the userscript");

					commentFlag.classList.add("fc-red-500");
					commentFlag.classList.remove("fc-black-100");
				}

				return;
			}
			//TODO handle result.Success === false
			StackExchange.helpers.showToast("Sending flag was not successful. Check console and network tab", { type: "warning", transientTimeout: 30000 });
			console.warn("quick flag response indicated it was not successful. Full data:", result);
		} catch (error: unknown) {
			if (isResponse(error)) {
				const body = await error.text();
				const { status, statusText } = error;

				//TODO catch and handle 409 - Conflict. Add to queue and retry sending;

				StackExchange.helpers.showToast(`Quick comment flag unsuccessful: ${body}`, { type: "danger", transientTimeout: 20000 });
				console.error(`Quick comment flag unsuccessful: code: [${status}] statusText: [${statusText}] body: [${body}]`);
				return;
			}

			console.error("Unexpected error when flagging. Check for a network error", error);
		}
	});
