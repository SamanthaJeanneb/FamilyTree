import React from 'react';
import FamilyTreePageHeader from '../navigation/FamilyTreePageHeader';
import './AboutPage.css'; // Import the custom CSS

const AboutPage = ({ username }) => {
  return (
    <div>
      {/* Header Component */}
      <FamilyTreePageHeader username={username} />

      {/* About Content */}
      <div className="about-container">
        <h1>About Us</h1>
        <p>
          Welcome to the Family Tree app! Our mission is to help users document
          and visualize their family history with ease. Our mission is to help users document
          and visualize their family history with ease.
        </p>

        {/* Image Credits Section */}
        <section>
          <h2>Image and Icon Credits</h2>
          <ul>
            <li>
              Banyan logo PNG designed by rinatrisaroh from{' '}
              <a
                href="https://pngtree.com/freepng/banyan-tree-logo-design-vector_8535961.html?sol=downref&id=bef"
                target="_blank"
                rel="noopener noreferrer"
              >
                PNGTree
              </a>
            </li>
            <li>
              Icons provided by{' '}
              <a
                href="https://lucide.dev/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Lucide Icons
              </a>
            </li>
          </ul>
        </section>

        {/* Additional Section */}
        <section>
          <h2>Team</h2>
          <p> Rashika Simkhada, Samantha Brown, Luke Romano, Riley Nixon, Aidan Hafer, Sherry Roy
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
