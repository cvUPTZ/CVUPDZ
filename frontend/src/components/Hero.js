// components/Hero.js
import React from 'react';
import { Link } from 'react-router-dom';
import ParticleBackground from './ParticleBackground';

function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center text-white">
      <ParticleBackground />
      <div className="z-10 text-center">
        <h1 className="text-5xl font-bold mb-4">Empowering Job Seekers in Algeria</h1>
        <p className="text-xl mb-8">Your career starts here! CV_UP helps you create the perfect CV, prepare for interviews, and find jobs in Algeria and abroad.</p>
        <div className="space-x-4">
          <Link to="/cv-builder" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">Start Your Journey</Link>
          <Link to="/#contact" className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md hover:bg-white hover:text-blue-600">Contact Us</Link>
        </div>
      </div>
    </section>
  );
}


export default Hero;
