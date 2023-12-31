import CanvasElement, { ElementTypes } from "./element";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "../utils";
import Vector from "../vector";
import { CanvasStyles } from "../styles";
import BoundingBox from "../boundingBox";

// Strokes
export class StrokeElement extends CanvasElement {
	private _points: Vector[] = [];
	private computedPath!: Path2D;

	constructor(styles?: Partial<CanvasStyles>) {
		super(ElementTypes.Stroke);
		if (styles) {
			this.styles = { ...this.styles, ...styles };
		}
	}

	public addPoint(point: Vector) {
		this._points.push(point);
	}

	public override calculateBoundingBox(): void {
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

		this._boundingBox = new BoundingBox(minX, minY, width, height);
	}

	override checkIntersection(
		point: Vector,
		ctx: CanvasRenderingContext2D
	): boolean {
		const isPointOnPath = ctx.isPointInPath(
			this.computedPath,
			point.x,
			point.y,
			"nonzero"
		);
		if (isPointOnPath) return true;
		else {
			const boxCenter = new Vector(
				this.boundingBox.x + this.boundingBox.w / 2,
				this.boundingBox.y + this.boundingBox.h / 2
			);
			const distance = Vector.distance(point, boxCenter);
			return distance <= 20;
		}
	}

	public smooth() {
		const { _points: points } = this;

		const len = points.length;
		if (len <= 2) return;

		// Averaging algorithm
		for (let i = 1; i < len - 1; i++) {
			points[i].x = (points[i - 1].x + points[i].x + points[i + 1].x) / 3;
			points[i].y = (points[i - 1].y + points[i].y + points[i + 1].y) / 3;
		}
	}

	protected override generateShape() {
		const outlinePoints = getStroke(this._points, {
			simulatePressure: true,
			size: this.styles.strokeWidth,
			thinning: 0.6,
			smoothing: 0.5,
			streamline: 0.5,
			easing: (t) => Math.sin((t * Math.PI) / 2), // https://easings.net/#easeOutSine
		});
		const pathData = getSvgPathFromStroke(outlinePoints);
		this.computedPath = new Path2D(pathData);
	}

	private freeDraw(ctx: CanvasRenderingContext2D) {
		ctx.shadowBlur = 3;
		ctx.shadowColor = this.styles.strokeColor;
		this.applyStyles(ctx, true);
		ctx.fill(this.computedPath);

		ctx.shadowBlur = 0;
		ctx.shadowColor = "";
	}

	private drawStroke(ctx: CanvasRenderingContext2D) {
		this.freeDraw(ctx);
	}

	protected override onDraw(ctx: CanvasRenderingContext2D): void {
		this.drawStroke(ctx);
	}
}
