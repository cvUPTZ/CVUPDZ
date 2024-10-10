// components/Services.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faUserTie, faGlobe } from '@fortawesome/free-solid-svg-icons';

function Services() {
  const services = [
    {
      icon: faFileAlt,
      title: "CV Optimization",
      description: "Make sure your CV passes ATS and stands out to recruiters with our expert CV review services."
    },
    {
      icon: faUserTie,
      title: "Interview Preparation",
      description: "Be fully prepared and confident for your job interviews with personalized coaching sessions."
    },
    {
      icon: faGlobe,
      title: "Global Job Opportunities",
      description: "Explore job opportunities in Algeria, Germany, Qatar, and other global markets."
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-100">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md transition duration-300 hover:shadow-xl">
              <FontAwesomeIcon icon={service.icon} className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
