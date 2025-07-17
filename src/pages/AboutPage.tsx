
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-serif font-medium mb-4">Our Story</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            How Nelysah Royal Care blossomed from a passion project to a beloved luxury beauty brand
          </p>
        </div>
        
        {/* Brand Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif mb-4">It Started With a Problem</h2>
            <p className="text-muted-foreground mb-4">
              Nelysah was born from necessity. Our founder, Lisa Chen, struggled with sensitive skin issues her entire life. Every product she tried either irritated her skin or simply didn't work as promised.
            </p>
            <p className="text-muted-foreground mb-4">
              Frustrated with the industry's one-size-fits-all approach, Lisa began creating her own formulations in 2015. What started as a personal solution quickly gained attention when friends and family noticed the remarkable improvements in her skin.
            </p>
            <p className="text-muted-foreground">
              With a background in biochemistry and a passion for natural ingredients, Lisa spent three years perfecting her formulas before officially launching Nelysah in 2018.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Nelysah founder" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Our Philosophy */}
        <div className="bg-lskin-lightGray p-8 md:p-12 rounded-lg mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif mb-6">Our Philosophy</h2>
            <p className="text-lg mb-6">
              At Nelysah, we believe skincare should be effective, transparent, and kind — to your skin and to our planet.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="font-medium mb-2">Effective</h3>
                <p className="text-muted-foreground">
                  We create products that work, backed by science and proven with results.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Transparent</h3>
                <p className="text-muted-foreground">
                  We believe you have the right to know exactly what's in your skincare.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Kind</h3>
                <p className="text-muted-foreground">
                  Our products are cruelty-free, and we continuously work to reduce our environmental impact.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Commitment Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
          <div className="order-2 md:order-1">
            <h2 className="text-2xl md:text-3xl font-serif mb-4">Our Commitment</h2>
            <p className="text-muted-foreground mb-4">
              We are committed to creating products that are:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-lskin-pink flex items-center justify-center mr-2 flex-shrink-0">✓</span>
                <span>Free from harmful chemicals and irritants</span>
              </li>
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-lskin-pink flex items-center justify-center mr-2 flex-shrink-0">✓</span>
                <span>Never tested on animals</span>
              </li>
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-lskin-pink flex items-center justify-center mr-2 flex-shrink-0">✓</span>
                <span>Formulated with sustainable ingredients</span>
              </li>
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-lskin-pink flex items-center justify-center mr-2 flex-shrink-0">✓</span>
                <span>Packaged in recyclable or biodegradable materials</span>
              </li>
            </ul>
            <p className="text-muted-foreground">
              We believe that beauty and sustainability can go hand in hand, and we're constantly innovating to reduce our environmental footprint.
            </p>
          </div>
          <div className="order-1 md:order-2 rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1591130222196-2b0918f42e1f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Nelysah products" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/*
        {/* Team Section
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-serif mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The passionate individuals behind Nelysah who are dedicated to creating exceptional skincare products.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Lisa Chen',
                role: 'Founder & CEO',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
              },
              {
                name: 'Dr. Emily Rodriguez',
                role: 'Head of Research & Development',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
              },
              {
                name: 'Michael Kim',
                role: 'Creative Director',
                image: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
              }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="h-60 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <h3 className="font-medium text-lg">{member.name}</h3>
                <p className="text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
        */}
      </div>
    </div>
  );
};

export default AboutPage;
