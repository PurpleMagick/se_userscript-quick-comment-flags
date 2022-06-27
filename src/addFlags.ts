import { flags } from "./flags";

function addQuickFlags(comment: Element) {
	const quickFlags = document.createElement("span");
	quickFlags.classList.add("quick-commend-flag-links");
	quickFlags.append(flags.NLN, " ", flags.Unfriendly, " ", flags.Rude);

	comment.classList.add("quick-comment-flags");
	comment.querySelector(".comment-date")
		?.parentElement
		?.append(quickFlags);
}

export function main() {
	const allComments = document.querySelectorAll("li.comment:not(.quick-comment-flags)");

	for (const comment of allComments)
		addQuickFlags(comment);
}
