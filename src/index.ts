import { attachListener } from "./attachListener";
import { main } from "./addFlags";

$(document).ajaxComplete(main);
main();

attachListener();
