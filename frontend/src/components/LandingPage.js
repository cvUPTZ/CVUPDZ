import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Briefcase, Users, MessageCircle } from 'lucide-react';
import ParticleBackground from './ParticleBackground';
import Header from './Header';
import Hero from './Hero';
import Services from './Services';
import JobSearch from './JobSearch';
import SuccessStories from './SuccessStories';
import Blog from './Blog';
import Contact from './Contact';
import Footer from './Footer';
import ChatBot from './ChatBot';

const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.pageYOffset / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-blue-500 z-50"
      style={{ scaleX: scrollProgress / 100, transformOrigin: '0%' }}
    />
  );
};

const FloatingActionButton = ({ icon: Icon, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg z-40"
    onClick={onClick}
  >
    <Icon size={24} />
  </motion.button>
);

const LandingPage = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'services', 'jobSearch', 'successStories', 'blog', 'contact', 'chatbot'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (currentSection) setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <ParticleBackground />
      <ScrollProgressBar />
      <Header />
      
      <nav className="fixed left-6 top-1/2 transform -translate-y-1/2 z-30">
        <ul className="space-y-4">
          {[
            { id: 'hero', icon: ArrowRight },
            { id: 'services', icon: Briefcase },
            { id: 'jobSearch', icon: BookOpen },
            { id: 'successStories', icon: Users },
            { id: 'blog', icon: MessageCircle },
            { id: 'chatbot', icon: MessageCircle }, // Add ChatBot section
          ].map(({ id, icon: Icon }) => (
            <li key={id}>
              <a href={`#${id}`}>
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-full ${activeSection === id ? 'bg-blue-500' : 'bg-gray-700'}`}
                >
                  <Icon size={20} />
                </motion.div>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="relative z-10">
        <section id="hero"><Hero /></section>
        <section id="services"><Services /></section>
        <section id="jobSearch"><JobSearch /></section>
        <section id="successStories"><SuccessStories /></section>
        <section id="blog"><Blog /></section>
        <section id="contact"><Contact /></section>
      </main>

      {/* ChatBot Section */}
      <div id="chatbot" className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transition-transform duration-300 ease-in-out ${isChatbotOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}>
        <ChatBot isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} />
      </div>

      <Footer />
      <FloatingActionButton icon={MessageCircle} onClick={() => setIsChatbotOpen(!isChatbotOpen)} />
    </div>
  );
};

export default LandingPage;
