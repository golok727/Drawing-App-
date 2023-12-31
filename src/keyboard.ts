import EventHandlerX from "./event";
import { Keys } from "./utils";

type ModifierKeys = { ctrl: boolean; shift: boolean; alt: boolean };
type KeyboardEventHandler = (event: AppKeyboardEvent) => void;

export type isPressedFn = (
	key: Keys | string,
	modifiers?: Partial<ModifierKeys>
) => boolean;

export type AppKeyboardEvent = {
	native: KeyboardEvent;
	isPressed: isPressedFn;
	isReleased: (key: Keys | string) => boolean;
	key: Keys | string;
};

const modifiersDefault: ModifierKeys = {
	ctrl: false,
	shift: false,
	alt: false,
};
class Keyboard {
	private keys: { [key: string]: boolean };
	onKeyDownHandlers: KeyboardEventHandler[];
	onKeyUpHandlers: KeyboardEventHandler[];

	constructor(
		onKeyDown?: KeyboardEventHandler,
		onKeyUp?: KeyboardEventHandler
	) {
		this.keys = {
			ctrl: false,
			shift: false,
			space: false,
			alt: false,
		};
		this.onKeyDownHandlers = [];

		this.onKeyUpHandlers = [];

		if (onKeyDown) this.onKeyDownHandlers.push(onKeyDown);
		if (onKeyUp) this.onKeyUpHandlers.push(onKeyUp);
		this.addEventListeners();
	}

	public isPressed(key: Keys | string, modifiers?: Partial<ModifierKeys>) {
		modifiers = {
			...modifiersDefault,
			...modifiers,
		};
		if (key === "") return this.compareModifiers(modifiers as ModifierKeys);

		return !!this.keys[key] && this.compareModifiers(modifiers as ModifierKeys);
	}

	public on(when: "keydown" | "keyup", handler: KeyboardEventHandler) {
		switch (when) {
			case "keydown":
				this.onKeyDownHandlers.push(handler);
				return this.onKeyDownHandlers.length;
			case "keyup":
				this.onKeyUpHandlers.push(handler);
				return this.onKeyUpHandlers.length;

			default:
				return -1;
		}
	}

	private compareModifiers(modifiers: ModifierKeys) {
		const { ctrl, shift, alt } = modifiers;
		return (
			ctrl === this.keys.ctrl &&
			shift === this.keys.shift &&
			alt === this.keys.alt
		);
	}

	private getKey(evt: KeyboardEvent, original = false) {
		let key = evt.key.toLowerCase();
		if (key === " ") key = "space";

		return original ? evt.key : key;
	}
	private handleKeyChange(evt: KeyboardEvent, isKeyDown: boolean) {
		const key = this.getKey(evt);
		this.keys.ctrl = evt.ctrlKey;
		this.keys.shift = evt.shiftKey;
		this.keys.alt = evt.altKey;
		this.keys[key] = isKeyDown;
		return key;
	}

	private isReleased(evt: KeyboardEvent) {
		return (key: Keys | string) => {
			return this.getKey(evt) === key;
		};
	}

	private makeEvent(
		native: KeyboardEvent,
		custom: { key: string }
	): AppKeyboardEvent {
		const event: AppKeyboardEvent = {
			native,
			...custom,
			isPressed: this.isPressed.bind(this),
			isReleased: this.isReleased.bind(this)(native),
		};
		return event;
	}
	private handleKeyDown(evt: KeyboardEvent) {
		const key = this.handleKeyChange(evt, true);

		for (const handler of this.onKeyDownHandlers)
			handler(this.makeEvent(evt, { key }));
	}

	private handleKeyUp(evt: KeyboardEvent) {
		const key = this.handleKeyChange(evt, false);
		for (const handler of this.onKeyUpHandlers) {
			handler(this.makeEvent(evt, { key }));
		}
	}

	private addEventListeners() {
		EventHandlerX.on(document, "keydown", this.handleKeyDown.bind(this));
		EventHandlerX.on(document, "keyup", this.handleKeyUp.bind(this));
	}
}

export default Keyboard;
