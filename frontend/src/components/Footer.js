import React from 'react';
import Container from 'react-bootstrap/Container';

export default function Footer() {
  return (
    <footer className="py-4 mt-auto" style={{ backgroundColor: '#1E1E1E', borderTop: '1px solid #333' }}>
      <Container className="text-center">
        <span className="text-secondary">
          &copy; {new Date().getFullYear()} ADAD Final Project. All rights reserved.
        </span>
      </Container>
    </footer>
  );
}