import CanvasElement from "./elements/element";
import { Tool } from "./toolbar";
export type UndoOrRedo = "undo" | "redo";

export namespace HistoryActions {
	export interface AddElement {
		type: "add_element";

		element: CanvasElement;
	}

	export interface ClearAll {
		type: "clear_all";

		elements: CanvasElement[];
	}

	export interface Erase {
		type: "erase";
		elements: CanvasElement[];
	}

	export interface Delete {
		type: "delete";
		elements: CanvasElement[];
	}

	export interface ToolChange {
		type: "tool_change";
		tool: Tool;
	}
}

export type HistoryAction =
	| HistoryActions.AddElement
	| HistoryActions.ClearAll
	| HistoryActions.Erase
	| HistoryActions.Delete
	| HistoryActions.ToolChange;

class AppHistory {
	private maxHistory;
	private history: HistoryAction[];
	private redoStack: HistoryAction[];
	onOldestRemove: (oldestAction: HistoryAction) => void;
	onRedoClear: (redoActions: HistoryAction[]) => void;

	constructor(max: number = 50) {
		this.history = [];
		this.redoStack = [];
		this.onOldestRemove = () => {};
		this.onRedoClear = () => {};
		this.maxHistory = max;
	}

	public add(action: HistoryAction) {
		this._add(action);
		this.onRedoClear(this.redoStack);
		this.redoStack = [];
	}
	public addCanvasElement(element: CanvasElement) {
		this.add({ type: "add_element", element });
	}

	public undo() {
		const lastAction = this.history.pop();
		if (lastAction) this.redoStack.push(lastAction);

		return lastAction;
	}

	public redo() {
		const lastAction = this.redoStack.pop();
		if (lastAction) this.history.push(lastAction);

		return lastAction;
	}
	public clear(): void {
		this.history = [];
		this.redoStack = [];
	}

	private _add(action: HistoryAction) {
		this.history.push(action);

		if (this.history.length >= this.maxHistory) {
			// Todo check if the same action is is already in it or not or clone it so that it removes reference issues
			let oldest = this.history.shift();
			if (oldest) this.onOldestRemove(oldest);
		}
	}
}

export default AppHistory;
