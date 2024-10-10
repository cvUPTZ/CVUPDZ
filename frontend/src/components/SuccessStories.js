// components/SuccessStories.js
import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

function SuccessStories() {
  const stories = [
    { id: 1, name: "Amine", role: "Software Engineer", image: "user1.jpg", quote: "Thanks to CV_UP, I got hired in Germany! Their CV tips were essential." },
    { id: 2, name: "Sara", role: "Marketing Specialist", image: "user2.jpg", quote: "I never knew the importance of ATS until CV_UP optimized my CV. I got interviews within days!" },
    { id: 3, name: "Youssef", role: "Data Analyst", image: "user3.jpg", quote: "Their interview coaching helped me nail my dream job in Qatar." }
  ];

  return (
    <section id="success-stories" className="py-20 bg-gray-100">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Success Stories</h2>
        <Carousel showArrows={true} infiniteLoop={true} showThumbs={false} showStatus={false} autoPlay={true} interval={5000}>
          {stories.map(story => (
            <div key={story.id} className="bg-white p-6 rounded-lg shadow-md">
              <img src={story.image} alt={story.name} className="w-24 h-24 rounded-full mx-auto mb-4" />
              <p className="text-gray-600 italic mb-4">"{story.quote}"</p>
              <h3 className="text-xl font-semibold">{story.name}</h3>
              <p className="text-gray-600">{story.role}</p>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

export default SuccessStories;
