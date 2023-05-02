import logo from './logo.svg';
import './App.css';
import LongPoolingChat from './LongPooling/long-pooling';
import WebSocketChat from './WebSocket/websocket';

function App() {
  return (
    <div className="App">
        {/* <LongPoolingChat/> */}
        <WebSocketChat/>

    </div>
  );
}

export default App;
