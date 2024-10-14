//Chatbot.js
import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';

const ChatBot = ({ isOpen, setIsOpen }) => {
  const [userInput, setUserInput] = useState('');
  const [botResponses, setBotResponses] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAdminStatus();
    fetchMessages();
    loadTelegramScript();

    // Cleanup to avoid memory leaks
    return () => {
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth;
      }
    };
  }, []);

  const loadTelegramScript = () => {
    // Prevent adding the script multiple times
    if (!document.getElementById('telegram-login-script')) {
      const script = document.createElement('script');
      script.id = 'telegram-login-script';
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.async = true;
      script.setAttribute('data-telegram-login', 'KeepHusteling_Bot'); // Replace with your bot's username
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      document.getElementById('telegram-login-widget').appendChild(script);

      window.onTelegramAuth = (user) => {
        setUser(user);
        console.log('Logged in as ', user);
      };
    }
  };

  const checkAdminStatus = async () => {
    // Mocked admin check; replace with real API call if needed
    setIsAdmin(true); // Set to true for testing purposes
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('https://cvupdz.vercel.app/api/bot/messages');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setBotResponses(data);
    } catch (err) {
      setError('Failed to fetch messages. Please try again later.');
    }
  };

  const handleInputChange = useCallback(
    debounce((value) => {
      setUserInput(value);
      setError('');
    }, 300), // Debounce delay (in milliseconds)
    []
  );

  const onChangeInput = (e) => {
    handleInputChange(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) {
      setError('Message cannot be empty.');
      return;
    }
    try {
      const response = await fetch('https://cvupdz.vercel.app/api/bot/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      // ... rest of the success logic ...
    } catch (err) {
      console.error('Error details:', err);
      setError(`Failed to send message: ${err.message}`);
    }
  };

  const handleAdminAction = async (action) => {
    try {
      const response = await fetch(`/api/bot/${action}`, { method: 'POST' });
      if (!response.ok) throw new Error(`Failed to perform ${action}`);
      const data = await response.json();
      alert(data.message);
    } catch (err) {
      alert(`Failed to perform ${action}`);
    }
  };

  const MessageList = React.memo(({ botResponses }) => {
    return (
      <div className="h-[calc(100%-130px)] overflow-y-auto p-4">
        {botResponses.map((item, index) => (
          <div key={index} className="mb-2">
            <div className="font-bold">User: {item.user}</div>
            <div>Bot: {item.bot}</div>
          </div>
        ))}
      </div>
    );
  });

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h3 className="font-semibold">Chat with us</h3>
        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
          &times;
        </button>
      </div>
      {!user ? (
        <div className="p-4 text-center">
          <h4 className="mb-4">Please log in with Telegram to continue</h4>
          <div id="telegram-login-widget"></div>
        </div>
      ) : (
        <>
          <MessageList botResponses={botResponses} />
          {error && <p className="text-red-600 text-center">{error}</p>}
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4 border-t">
            <div className="flex">
              <input
                type="text"
                value={userInput}
                onChange={onChangeInput}
                className="flex-grow px-4 py-2 rounded-l-md border focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Type your message..."
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </form>
          {isAdmin && (
            <div className="p-4 border-t">
              <button onClick={() => handleAdminAction('scrapeLinkedIn')} className="mr-2 px-4 py-2 bg-green-600 text-white rounded-md">
                Scrape LinkedIn
              </button>
              <button onClick={() => handleAdminAction('offremploi')} className="px-4 py-2 bg-green-600 text-white rounded-md">
                Get Job Offers
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatBot;
