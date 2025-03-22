"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tip = void 0;
const react_1 = __importStar(require("react"));
require("../style/Tip.css");
class Tip extends react_1.Component {
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
        return (react_1.default.createElement("div", { className: "Tip" }, compact ? (react_1.default.createElement("div", { className: "Tip__compact", onClick: () => {
                onOpen();
                this.setState({ compact: false });
            } }, "Add highlight")) : (react_1.default.createElement("form", { className: "Tip__card", onSubmit: (event) => {
                event.preventDefault();
                onConfirm({ text, note, emoji, color });
            } },
            react_1.default.createElement("div", null,
                react_1.default.createElement("textarea", { placeholder: "Add title here", value: text, onChange: (event) => this.setState({ text: event.target.value }) }),
                react_1.default.createElement("br", null),
                react_1.default.createElement("textarea", { placeholder: "Type your note", value: note, onChange: (event) => this.setState({ note: event.target.value }) }),
                react_1.default.createElement("div", null, ["💩", "😱", "😍", "🔥", "😳", "⚠️"].map((emoji) => (react_1.default.createElement("label", { key: emoji },
                    react_1.default.createElement("input", { checked: emoji === this.state.emoji, type: "radio", name: "emoji", value: emoji, onChange: (event) => this.setState({ emoji: event.target.value }) }),
                    emoji)))),
                react_1.default.createElement("div", { style: { color: "black", fontSize: "16px" } }, "Select Color"),
                react_1.default.createElement("div", { style: { color: "black" } }, ["🟢", "🔴", "🔵", "🟠", "🟡", "🟣"].map((colorEmoji, index) => (react_1.default.createElement("label", { key: index },
                    react_1.default.createElement("input", { checked: colorEmoji === this.state.colorEmoji, type: "radio", name: "color", value: colorEmoji, onChange: (event) => {
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
            react_1.default.createElement("div", null,
                react_1.default.createElement("input", { type: "submit", value: "Save" }))))));
    }
}
exports.Tip = Tip;
exports.default = Tip;
//# sourceMappingURL=Tip.js.map