import React, { Component } from "react";
import "../style/Tip.css";
interface State {
    compact: boolean;
    text: string;
    note: string;
    emoji: string;
    color: string;
    colorEmoji: string;
}
interface Props {
    onConfirm: (comment: {
        text: string;
        note: string;
        emoji: string;
        color: string;
    }) => void;
    onOpen: () => void;
    onUpdate?: () => void;
}
export declare class Tip extends Component<Props, State> {
    state: State;
    componentDidUpdate(nextProps: Props, nextState: State): void;
    render(): React.JSX.Element;
}
export default Tip;
