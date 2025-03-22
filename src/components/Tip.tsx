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

export class Tip extends Component<Props, State> {
  state: State = {
    compact: true,
    text: "",
    note: "",
    emoji: "",
    color: "",
    colorEmoji: "",
  };

  // for TipContainer
  componentDidUpdate(nextProps: Props, nextState: State) {
    const { onUpdate } = this.props;

    if (onUpdate && this.state.compact !== nextState.compact) {
      onUpdate();
    }
  }

  render() {
    const { onConfirm, onOpen } = this.props;
    const { compact, text, note, emoji, color } = this.state;

    return (
      <div className="Tip">
        {compact ? (
          <div
            className="Tip__compact"
            onClick={() => {
              onOpen();
              this.setState({ compact: false });
            }}
          >
            Add highlight
          </div>
        ) : (
          <form
            className="Tip__card"
            onSubmit={(event) => {
              event.preventDefault();
              onConfirm({ text, note, emoji, color });
            }}
          >
            <div>
              <textarea
                placeholder="Add title here"
                value={text}
                onChange={(event) =>
                  this.setState({ text: event.target.value })
                }
                // ref={(node) => {
                //   if (node) {
                //     node.focus();
                //   }
                // }}
              />
              <br />
              <textarea
                placeholder="Type your note"
                value={note}
                onChange={(event) =>
                  this.setState({ note: event.target.value })
                }
              />

              <div>
                {["💩", "😱", "😍", "🔥", "😳", "⚠️"].map((emoji) => (
                  <label key={emoji}>
                    <input
                      checked={emoji === this.state.emoji}
                      type="radio"
                      name="emoji"
                      value={emoji}
                      onChange={(event) =>
                        this.setState({ emoji: event.target.value })
                      }
                    />
                    {emoji}
                  </label>
                ))}
              </div>
              <div style={{ color: "black", fontSize: "16px" }}>
                Select Color
              </div>
              <div style={{ color: "black" }}>
                {["🟢", "🔴", "🔵", "🟠", "🟡", "🟣"].map(
                  (colorEmoji, index) => (
                    <label key={index}>
                      <input
                        checked={colorEmoji === this.state.colorEmoji}
                        type="radio"
                        name="color"
                        value={colorEmoji}
                        onChange={(event) => {
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
                        }}
                      />
                      {colorEmoji}
                    </label>
                  )
                )}
              </div>
            </div>
            <div>
              <input type="submit" value="Save" />
            </div>
          </form>
        )}
      </div>
    );
  }
}

export default Tip;
