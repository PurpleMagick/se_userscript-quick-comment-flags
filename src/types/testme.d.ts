import { FlagType } from "./flagTypes";

interface FlagOptions {
	text: string;
	tooltip: string;
	flagId: FlagType;
}

interface CommentFlagResponseSuccess {
	Success: true;
	FlagType: FlagType;
	ResultChangedState: boolean;
	Outcome: 0
}

interface CommentFlagResponseFailure {
	Success: false;
	FlagType: FlagType;
	ResultChangedState: boolean;
	Outcome: number
}
type CommentFlagResponse = CommentFlagResponseSuccess | CommentFlagResponseFailure
