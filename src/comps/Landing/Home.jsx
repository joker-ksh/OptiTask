import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-800">
      <div className="flex flex-col space-y-4">
        <Link to="/Landing">
          <button className="w-48 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md transition duration-200">
            Manager
          </button>
        </Link>
        <Link to="/developer">
          <button className="w-48 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md transition duration-200">
            Developer
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
