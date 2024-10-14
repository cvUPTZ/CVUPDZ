import React from 'react';

const ChatBot = ({ setIsOpen }) => {
  const handleRedirect = () => {
    window.location.href = 'https://t.me/+KjoAumLaOYY3YTlk';
  };

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl flex items-center justify-center">
      <div className="p-4 text-center">
        <h3 className="font-semibold mb-4">Join our Telegram Group</h3>
        <button
          onClick={handleRedirect}
          className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none"
        >
          Go to Telegram
        </button>
        <button onClick={() => setIsOpen(false)} className="mt-4 text-gray-600 hover:text-gray-800">
          &times; Close
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
