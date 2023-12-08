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
	key: Keys | string;
};

const modifiersDefault: ModifierKeys = {
	ctrl: false,
	shift: false,
	alt: false,
};
class Keyboard {
	private keys: { [key: string]: boolean } = {
		ctrl: false,
		shift: false,
		space: false,
		alt: false,
	};
	onKeyDownHandlers: KeyboardEventHandler[] = [];
	onKeyUpHandlers: KeyboardEventHandler[] = [];
	private refHandlers!: {
		keyDownHandler: (_: KeyboardEvent) => void;
		keyUpHandler: (_: KeyboardEvent) => void;
	};

	constructor(
		onKeyDown?: KeyboardEventHandler,
		onKeyUp?: KeyboardEventHandler
	) {
		if (onKeyDown) this.onKeyDownHandlers.push(onKeyDown);

		if (onKeyUp) this.onKeyUpHandlers.push(onKeyUp);
		this.addEventListeners();
	}

	public destroy() {
		document.removeEventListener("keydown", this.refHandlers.keyDownHandler);
		document.removeEventListener("keyup", this.refHandlers.keyUpHandler);
		this.onKeyDownHandlers = [];
		this.onKeyUpHandlers = [];
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
	private makeEvent(
		native: KeyboardEvent,
		custom: { key: string }
	): AppKeyboardEvent {
		const event: AppKeyboardEvent = {
			native,
			...custom,
			isPressed: this.isPressed.bind(this),
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
		this.refHandlers = { ...this.refHandlers };
		this.refHandlers.keyDownHandler = this.handleKeyDown.bind(this);
		this.refHandlers.keyUpHandler = this.handleKeyUp.bind(this);

		document.addEventListener("keydown", this.refHandlers.keyDownHandler);
		document.addEventListener("keyup", this.refHandlers.keyUpHandler);
	}
}

export default Keyboard;