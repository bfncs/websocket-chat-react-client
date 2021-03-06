import * as React from "react";
import "./App.css";
import { IChatMessage, ILogin, IMessage, Messages } from "./messages";
import WebsocketProvider, { MessageSender } from "./WebsocketProvider";

interface IProps {
  userId: string;
}

interface IState {
  messageInput: string;
  messages: IMessage[];
}

const getWebsocketUrl = (userId: string) =>
  `ws://localhost:8080/events?user=${userId}`;

class App extends React.Component<IProps, IState> {
  state: IState = {
    messageInput: "",
    messages: []
  };

  addChatMessage = (msg: IChatMessage) => {
    this.setState(state => ({
      messages: [...state.messages, msg]
    }));
  };

  addLogin = (msg: ILogin) => {
    this.setState(state => ({
      messages: [...state.messages, msg]
    }));
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ messageInput: e.target.value });

  handleKeyPress = (sendMessage: MessageSender<IMessage>) => (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const { messageInput } = this.state;
    if (e.key === "Enter" && messageInput) {
      const msg: IChatMessage = {
        type: "ChatMessage",
        id: Date.now().toString(),
        author: this.props.userId,
        message: messageInput
      };
      sendMessage(msg);
      this.addChatMessage(msg);
      this.setState({ messageInput: "" });
    }
  };

  handleMessage = (message: IMessage) => {
    // tslint:disable-next-line no-console
    console.log("Got message", message);
    switch (message.type) {
      case "ChatMessage":
        this.addChatMessage({
          type: "ChatMessage",
          author: message.author,
          id: Date.now().toString(),
          message: message.message
        });
        return;
      case "Login":
        this.addLogin({
          type: "Login",
          id: Date.now().toString(),
          user: message.user
        });
        return;
      default:
        // tslint:disable-next-line no-console
        console.warn("Received an unexpected message", message);
    }
  };

  handleConnected = (sendMessage: MessageSender<IMessage>) => {
    sendMessage({
      type: "Login",
      id: Date.now().toString(),
      user: this.props.userId
    });
  };

  public render(): JSX.Element {
    return (
      <WebsocketProvider
        websocketUrl={getWebsocketUrl(this.props.userId)}
        onConnected={this.handleConnected}
        onMessage={this.handleMessage}
      >
        {sendMessage => (
          <div className="App">
            <input
              type="text"
              className={"messageInput"}
              value={this.state.messageInput}
              placeholder={"Type message…"}
              onChange={this.handleChange}
              onKeyPress={this.handleKeyPress(sendMessage)}
              autoFocus={true}
            />
            <div className="messages">
              <Messages messages={this.state.messages} />
            </div>
          </div>
        )}
      </WebsocketProvider>
    );
  }
}

export default App;
