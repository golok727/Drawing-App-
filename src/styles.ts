import { COLORS } from "./utils";

export interface CanvasStyles {
	fillColor: string;
	strokeColor: string;
	strokeWidth: number;

	lineDash: number[];
}
const DefaultCanvasStyles: CanvasStyles = {
	fillColor: COLORS.WHITE,
	strokeColor: COLORS.WHITE,
	strokeWidth: 7,
	lineDash: [],
};

export { DefaultCanvasStyles };
