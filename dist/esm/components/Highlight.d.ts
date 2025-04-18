import React, { Component } from "react";
import "../style/Highlight.css";
import type { LTWHP } from "../types.js";
interface Props {
    position: {
        boundingRect: LTWHP;
        rects: Array<LTWHP>;
    };
    onClick?: () => void;
    onMouseOver?: () => void;
    onMouseOut?: () => void;
    comment: {
        emoji: string;
        text: string;
        note?: string;
        color: string;
    };
    isScrolledTo: boolean;
}
export declare class Highlight extends Component<Props> {
    render(): React.JSX.Element;
}
export default Highlight;
