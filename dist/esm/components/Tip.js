import React, { Component } from "react";
import "../style/Tip.css";
export class Tip extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            compact: true,
            text: "",
            note: "",
            emoji: "",
            color: "",
            colorEmoji: "",
        };
    }
    // for TipContainer
    componentDidUpdate(nextProps, nextState) {
        const { onUpdate } = this.props;
        if (onUpdate && this.state.compact !== nextState.compact) {
            onUpdate();
        }
    }
    render() {
        const { onConfirm, onOpen } = this.props;
        const { compact, text, note, emoji, color } = this.state;
        return (React.createElement("div", { className: "Tip" }, compact ? (React.createElement("div", { className: "Tip__compact", onClick: () => {
                onOpen();
                this.setState({ compact: false });
            } }, "Add highlight")) : (React.createElement("form", { className: "Tip__card", onSubmit: (event) => {
                event.preventDefault();
                onConfirm({ text, note, emoji, color });
            } },
            React.createElement("div", null,
                React.createElement("textarea", { placeholder: "Add title here", value: text, onChange: (event) => this.setState({ text: event.target.value }) }),
                React.createElement("br", null),
                React.createElement("textarea", { placeholder: "Type your note", value: note, onChange: (event) => this.setState({ note: event.target.value }) }),
                React.createElement("div", null, ["💩", "😱", "😍", "🔥", "😳", "⚠️"].map((emoji) => (React.createElement("label", { key: emoji },
                    React.createElement("input", { checked: emoji === this.state.emoji, type: "radio", name: "emoji", value: emoji, onChange: (event) => this.setState({ emoji: event.target.value }) }),
                    emoji)))),
                React.createElement("div", { style: { color: "black", fontSize: "16px" } }, "Select Color"),
                React.createElement("div", { style: { color: "black" } }, ["🟢", "🔴", "🔵", "🟠", "🟡", "🟣"].map((colorEmoji, index) => (React.createElement("label", { key: index },
                    React.createElement("input", { checked: colorEmoji === this.state.colorEmoji, type: "radio", name: "color", value: colorEmoji, onChange: (event) => {
                            let selectedColor = "";
                            switch (colorEmoji) {
                                case "🟢":
                                    selectedColor = "green";
                                    break;
                                case "🔴":
                                    selectedColor = "red";
                                    break;
                                case "🔵":
                                    selectedColor = "blue";
                                    break;
                                case "🟠":
                                    selectedColor = "orange";
                                    break;
                                case "🟡":
                                    selectedColor = "yellow";
                                    break;
                                case "🟣":
                                    selectedColor = "purple";
                                    break;
                                default:
                                    selectedColor = "";
                                    break;
                            }
                            this.setState({
                                color: selectedColor,
                                colorEmoji: colorEmoji,
                            });
                        } }),
                    colorEmoji))))),
            React.createElement("div", null,
                React.createElement("input", { type: "submit", value: "Save" }))))));
    }
}
export default Tip;
//# sourceMappingURL=Tip.js.map