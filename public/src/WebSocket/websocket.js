

import react from 'react';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuid } from 'uuid'
import './style.css';


// const SOCKET_BASE_URL = 'ws://localhost:5000';
// const BASE_URL = 'http://localhost:8000';
const SOCKET_BASE_URL = process.env.REACT_APP_SOCKET_BASE_URL;
const BASE_URL = 'http://localhost:8000';

console.log('Base URL', BASE_URL);
console.log('Socket URL', SOCKET_BASE_URL);


function WebSocketChat() {

    const userNameStorage = localStorage.getItem('userName');
    const [storedMessages, setStoredMessages] = useState([]);
    const [userName, setUserName] = useState(userNameStorage || '');
    const [messages, setMessages] = useState([]);
    const [value, setValue] = useState("");
    const [showLogin, setShowLogin] = useState(true);

    const [users, setUsers] = useState();
    const [showUsers, setShowUsers] = useState(false);
/*=============================== */

    const getMessages = async () =>{
        const {data} = await axios.get(`${BASE_URL}/messages`);
        console.log(data);
        const reversed = data.reverse();
        setStoredMessages(prev => [...prev, ...reversed]);
        
        console.log(data);
    }


    const getUsers = async () =>{
        const {data} = await axios.get(`${BASE_URL}/users`);
        console.log(data);
        setUsers(data);
        setShowUsers(true);

    }
/*=============================== */





    const id = uuid();

    const subscribeOnAuth = async () => {
        try {
            const { data } = await axios.get(`/login?id=${id}`);
            const name = `${data.firstName} ${data.lastName}`;
            setUserName(name);
            localStorage.setItem('userName', name);
            setShowLogin(false);
        } catch (err) {
            console.error(err);
            subscribeOnAuth();
        }
    };


    const socket = useRef();
    const [connected, setConnected] = useState(false);

    const subscribe = async () => {
        socket.current = new WebSocket(SOCKET_BASE_URL);
        console.log('subscribe');

        socket.current.onopen = () => {
            console.log(`WebSocket connection was created with:${SOCKET_BASE_URL}`);
            setConnected(true);
            const userNameFromLocalStorage = localStorage.getItem('userName');
            const message = {
                event: 'first-connect',
                messageId: uuid(),
                userName: userNameFromLocalStorage,
                date: Date.now()
            };

            console.log(message);

            socket.current.send(JSON.stringify(message));
            console.log('message was sent');
        };

        socket.current.onclose = (event) => {
            console.log(`WebSocket connection was closed`, event);
            setConnected(false);
            // setTimeout(() => {
            //   console.log(`WebSocket connection retried`);
            //   subscribe();
            // }, 1000);
        }; // onclose

        socket.current.onerror = (error) => {
            console.log(`WebSocket connection has error`, error);
        }; // onerror

        socket.current.onmessage = (event) => {
            const messageString = event.data.toString();
            console.log(`WebSocket connection has message:${messageString}`);
            const message = JSON.parse(messageString);
            switch (message.event) {
                case 'message':
                    setMessages((prev) => [...prev, message]);
                    break;
                case 'emoji':
                    setMessages((prev) => {
                        const current = prev.find(e => e.messageId == message.selectedMessageId);
                        if (!current) {
                            return prev;
                        }
                        if (!current.likes) {
                            current.likes = { positive: 0, negative: 0 };
                        }
                        if (message.data == 'like') {
                            current.likes.positive += 1;
                        } else {
                            current.likes.negative += 1;
                        }
                        return [...prev];
                    });
            }
        }; // onmessage

    } // subscribe



    useEffect(() => {
        if (userName) {
            setUserName(userName);
            setShowLogin(false);
            getMessages();
            console.log('get messages subscribe else');
            subscribe();
            
        }
        else {
            subscribeOnAuth().then(() => {
                console.log('get messages subscribe else');
                getMessages();
                subscribe();
            })
        }
    }, [])

    const sendMessage = async () => {
        const message = {
            event: 'message',
            messageId: uuid(),
            userName,
            text: value,
            date: Date.now()
        };
        console.log("sendMessage");
        socket.current.send(JSON.stringify(message));
    };



    return (

        <>
            <div className="login" style={{ display: showLogin || !connected ? 'flex' : 'none' }}>
                <input type="text" value={id} readOnly />
                {
                    (!userName || !connected) &&
                    <div class="lds-facebook"><div></div><div></div><div></div></div>
                }
            </div>
            <div className="container">
                <div className="form">
                    <input
                        type="text"
                        value={value}
                        onChange={e => setValue(e.target.value)} />
                    <button onClick={sendMessage}>Send message</button>
                </div>
                <div className="messages">
                    {storedMessages.map(message => <div>
                        <div className="userInfo">
                            <b>{message.userName}</b><br />
                            <b style={{ fontSize: '10px' }}>{new Date(message.date).toISOString()}</b>
                        </div>
                        <div className="message">{message.message}</div>
                    </div>)}

                    {messages.map(message => <div>
                        <div className="userInfo">
                            <b>{message.userName}</b><br />
                            <b style={{ fontSize: '10px' }}>{new Date(message.date).toISOString()}</b>
                        </div>
                        <div className="message">{message.text}</div>
                    </div>)}
                </div>
            </div>
            
            <div style={{width: '100%', textAlign: 'center', marginTop: '30px'}}>
                <button onClick={getUsers}>Get Users</button>
            </div>

            {showUsers ? <div className='usersStatus'>
                <button style={{alignItems: 'center'}} onClick={() =>{setShowUsers(false)}}>Close</button>
                {users.map(el => <div>
                    <span style={{marginRight: '15px', padding: '10px', boxSizing: 'border-box'}}>{el.userName}</span>
                    <span>{el.status.toString()}</span>
                </div>)}
            </div> : <div></div> }
            
        </>

    )
}


export default WebSocketChat;