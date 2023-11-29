import Toolbar, { Tool } from "./toolbar";

export type EventHandlers = {
	[K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void;
};
type Component = { element: Element; handlers: EventHandlers };

class UI {
	private components: { element: Element; handlers: EventHandlers }[] = [];
	private isRegistered = false;
	private navBackground = document.getElementById("nav-bg");

	constructor() {}

	enableNavEvents() {
		this.navBackground?.classList.remove("pointer-events-none");
	}
	disableNavEvents() {
		this.navBackground?.classList.add("pointer-events-none");
	}
	setCursor(canvas: HTMLCanvasElement, tool: Tool) {
		switch (tool) {
			case "brush":
				canvas.style.cursor = "url(/brush-cursor.png), crosshair";
				break;

			case "eraser":
				canvas.style.cursor = "crosshair";
				break;

			case "rect":
			case "circle":
			case "line":
			case "texture":
				canvas.style.cursor = "crosshair";
				break;

			case "highlighter":
				canvas.style.cursor = "url(/laser-cursor.png) 20 15, crosshair";
				break;

			case "selector":
				canvas.style.cursor = "default";
				break;
		}
	}

	addComponent<T extends Element>(element: T, handlers: EventHandlers) {
		if (this.isRegistered)
			throw new Error("The components are already registered..");
		const component = this.registerComponent({ element, handlers });
		this.components.push(component);
	}

	destroy() {
		for (const component of this.components) {
			for (const type in component.handlers) {
				const eventType = type as keyof HTMLElementEventMap;
				const eventHandler = component.handlers[eventType];

				component.element.removeEventListener(
					type,
					eventHandler as EventListener
				);
			}
		}
	}

	private registerComponent(component: Component): Component {
		for (const type in component.handlers) {
			const eventType = type as keyof HTMLElementEventMap;
			const eventHandler = component.handlers[eventType];
			component.element.addEventListener(type, eventHandler as EventListener);
		}
		return component;
	}

	toolbarInit(onToolChange?: (tool: Tool) => void) {
		new Toolbar(onToolChange);
	}
}

export default UI;
