import React from 'react';
//import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col">

      {/* Content */}
      <div className="flex-grow max-w-4xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-bold text-center text-blue-700 dark:text-cyan-400 mb-12 transition-colors">
          About <span className="text-slate-900 dark:text-white">FutureCollege.com</span>
        </h1>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 border border-transparent dark:border-slate-800 transition-colors">
          <div className="prose max-w-none">
            {/* Intro */}
            <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
              <strong>FutureCollege.com</strong> is your trusted companion for finding the perfect engineering college
              for <strong>First Year Engineering (FYE)</strong> admissions. We understand how critical
              and confusing the college selection process can be, and we’re here to make it simple and stress-free.
            </p>

            {/* Mission */}
            <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-cyan-300">🎯 Our Mission</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              To simplify the college selection process by providing accurate, data-driven predictions
              and authentic student reviews — empowering every learner to make informed academic decisions.
            </p>

            {/* What We Offer */}
            <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-cyan-300">📦 What We Offer</h2>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start text-slate-700 dark:text-slate-300">
                <span className="mr-3 text-lg">🔍</span>
                <span>AI-powered college prediction based on your MHT-CET percentile and category</span>
              </li>
              <li className="flex items-start text-slate-700 dark:text-slate-300">
                <span className="mr-3 text-lg">🏫</span>
                <span>Access to a comprehensive database of engineering colleges across Maharashtra</span>
              </li>
              <li className="flex items-start text-slate-700 dark:text-slate-300">
                <span className="mr-3 text-lg">⭐</span>
                <span>Verified reviews and ratings by current students and alumni</span>
              </li>
              <li className="flex items-start text-slate-700 dark:text-slate-300">
                <span className="mr-3 text-lg">📊</span>
                <span>College insights — cutoff ranks, fees, facilities, and more</span>
              </li>
              <li className="flex items-start text-slate-700 dark:text-slate-300">
                <span className="mr-3 text-lg">🤝</span>
                <span>Personalized recommendations for your profile</span>
              </li>
            </ul>

            {/* Future Scope */}
            <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-cyan-300 mt-8">🚀 Future Scope</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              While we currently focus on First Year Engineering admissions, we’re actively working toward
              scaling the platform for more entrance exams and domains. Our upcoming expansions include:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6 ml-2">
              <li>MHT-CET predictions for Engineering, Pharmacy & Agriculture</li>
              <li>JEE (Main & Advanced) college prediction and IIT explorer</li>
              <li>NEET UG/PG support for medical & dental colleges</li>
              <li>Law admissions including CLAT & MH-CET Law</li>
              <li>Pharmacy and Allied Health Sciences counseling</li>
              <li>Career guidance tools, personality assessments, and more</li>
            </ul>

            <p className="text-slate-700 dark:text-slate-300 mb-6 font-medium">
              Our vision is to become India’s most student-centric, intelligent, and reliable
              platform for college admissions and career planning.
            </p>

            {/* CTA Button */}
            <div className="text-center mt-10">
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
