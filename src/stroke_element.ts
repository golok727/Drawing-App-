import CanvasElement, { ElementTypes } from "./element";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "./utils";
import Vector from "./vector";
import { CanvasStyles } from "./styles";

type BrushTypes = "normal" | "tapered";
// Strokes
export class StrokeElement extends CanvasElement {
	private brushType: BrushTypes = "normal";
	private _points: Vector[] = [];
	private _done = false;
	private computedPath!: Path2D;

	constructor(styles?: Partial<CanvasStyles>) {
		super(ElementTypes.Stroke);
		if (styles) {
			this.styles = { ...this.styles, ...styles };
		}
	}

	addPoint(point: Vector) {
		this._points.push(point);
	}
	setDone(val: boolean) {
		this._done = val;
		this.calculateBoundingBox();
	}
	override calculateBoundingBox(): void {
		if (this._points.length === 0) return;
		let minX = this._points[0].x;
		let minY = this._points[0].y;
		let maxX = this._points[0].x;
		let maxY = this._points[0].y;

		for (const point of this._points) {
			minX = Math.min(minX, point.x);
			minY = Math.min(minY, point.y);
			maxX = Math.max(maxX, point.x);
			maxY = Math.max(maxY, point.y);
		}

		const width = maxX - minX;
		const height = maxY - minY;

		this._boundingBox = { x: minX, y: minY, width, height };
	}

	override checkIntersection(
		point: [number, number],
		ctx: CanvasRenderingContext2D
	): boolean {
		return ctx.isPointInPath(this.computedPath, point[0], point[1], "nonzero");
	}

	private generatePath() {
		const outlinePoints = getStroke(this._points, {
			simulatePressure: false,
			size: this.styles.strokeWidth,
			smoothing: 0.7,
			end: { taper: 3 },
		});
		const pathData = getSvgPathFromStroke(outlinePoints);
		this.computedPath = new Path2D(pathData);
	}

	private freeDraw(ctx: CanvasRenderingContext2D) {
		if (!this._done) this.generatePath();
		ctx.fillStyle = this.styles.strokeColor;
		ctx.fill(this.computedPath);
	}

	private drawStroke(ctx: CanvasRenderingContext2D) {
		switch (this.brushType) {
			case "normal":
				this.freeDraw(ctx);
				break;
			case "tapered":
				break;
		}
	}

	override draw(ctx: CanvasRenderingContext2D): void {
		this.drawStroke(ctx);
	}
}
