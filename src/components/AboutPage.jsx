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
          and visualize their family history with ease. This app is designed
          with simplicity and functionality in mind, making it accessible for
          everyone to create and maintain their family trees.
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
          <h2>Our Vision</h2>
          <p>
            We believe in preserving family heritage and making it easy for
            everyone to trace their roots. Our team is committed to creating a
            seamless and intuitive experience for users, no matter their level
            of technical expertise.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
