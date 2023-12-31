import Toolbar, { Tool } from "./toolbar";
import { BG_COLORS, COLORS } from "./utils";

export type EventHandlers = {
	[K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void;
};
type Component = { element: Element; handlers: EventHandlers };

class UI {
	private components: { element: Element; handlers: EventHandlers }[];
	private isRegistered: boolean;
	private currentStrokeColorSpan: HTMLSpanElement | null;
	private currentFillColorSpan: HTMLSpanElement | null;
	public toolbar: Toolbar | null;

	private appContainer: HTMLDivElement;

	public readonly drawingState = {
		strokeColor: COLORS.WHITE as string,
		fillColor: COLORS.NONE as string,
		strokeWidth: 4,
	};

	constructor() {
		this.components = [];
		this.isRegistered = false;
		this.currentStrokeColorSpan = null;
		this.currentFillColorSpan = null;
		this.toolbar = null;
		this.appContainer = document.getElementById(
			"app-container"
		) as HTMLDivElement;

		this.penSizeRangeSetup();
		this.makeColorPicker("stroke");
		this.makeColorPicker("fill");
		if (!this.appContainer) console.warn("App Container is null");
	}

	public makeToolBar(onToolChange?: (tool: Tool) => void) {
		this.toolbar = new Toolbar(onToolChange);
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

	public enableAppPointerEvents() {
		this.appContainer.style.pointerEvents = "all";
	}

	public disableAppPointerEvents() {
		this.appContainer.style.pointerEvents = "none";
	}

	private penSizeRangeSetup() {
		const range = document.getElementById("pen-size") as HTMLInputElement;
		if (!range) return;
		const strokeWidth = parseInt(range.value);
		this.drawingState.strokeWidth = strokeWidth;

		range.addEventListener("change", (evt) => {
			const range = evt.currentTarget as HTMLInputElement;
			this.drawingState.strokeWidth = parseInt(range.value) ?? 4;
		});
	}
	private makeColorPicker(type: "stroke" | "fill") {
		const containerId = type === "stroke" ? "strokeColor" : "fillColor";
		const container = document.getElementById(containerId) as HTMLDivElement;

		Object.entries(type === "stroke" ? COLORS : BG_COLORS).forEach((color) => {
			const value = color[1];

			const span = document.createElement("span");
			span.classList.add(
				"w-5",
				"h-5",
				"rounded-md",
				"cursor-pointer",
				"hover:scale-105",
				"transition-transform"
			);
			if (value === COLORS.NONE) {
				span.classList.add("border-[2px]", "border-black");
			}

			if (type === "stroke" && this.drawingState.strokeColor === value) {
				this.currentStrokeColorSpan = span;
				span.classList.add("outline");
			} else if (type === "fill" && this.drawingState.fillColor === value) {
				this.currentFillColorSpan = span;
				span.classList.add("outline");
			}

			span.style.backgroundColor = value;
			span.setAttribute("color", value);
			span.setAttribute("picker-for", type);

			span.addEventListener("click", (evt) => {
				const span = evt.currentTarget as HTMLSpanElement;

				if (
					span === this.currentStrokeColorSpan ||
					span === this.currentFillColorSpan
				)
					return;

				const pickerFor = span.getAttribute("picker-for");
				const color = span.getAttribute("color") ?? COLORS.WHITE;

				if (pickerFor === "stroke") {
					this.drawingState.strokeColor = color;

					this.currentStrokeColorSpan?.classList.remove("outline");
					span.classList.add("outline");

					this.currentStrokeColorSpan = span;
				} else {
					this.drawingState.fillColor = color;

					this.currentFillColorSpan?.classList.remove("outline");
					span.classList.add("outline");

					this.currentFillColorSpan = span;
				}
			});

			container.appendChild(span);
		});
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
}

export default UI;
