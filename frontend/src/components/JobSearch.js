// components/JobSearch.js
import React, { useState } from 'react';

function JobSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobListings, setJobListings] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Simulated job search - replace with actual API call
    setJobListings([
      { id: 1, title: "Software Developer", company: "Tech Co", description: "Exciting opportunity for a skilled developer..." },
      { id: 2, title: "Marketing Manager", company: "Brand Inc", description: "Lead our marketing efforts and drive growth..." },
      { id: 3, title: "Data Analyst", company: "Data Corp", description: "Turn data into actionable insights..." }
    ]);
  };

  return (
    <section id="job-search" className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Find Your Dream Job</h2>
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex">
            <input
              type="text"
              className="flex-grow px-4 py-2 rounded-l-md border-t border-b border-l text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter job title, skills, or company"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-r-md hover:bg-blue-700">Search</button>
          </div>
        </form>
        <div className="space-y-4">
          {jobListings.map(job => (
            <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
              <h4 className="text-lg text-gray-600 mb-2">{job.company}</h4>
              <p className="text-gray-600 mb-4">{job.description}</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Apply Now</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


export default JobSearch;
