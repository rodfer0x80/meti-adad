import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();

  return (
    <Navbar expand="lg" variant="dark" sticky="top" className="py-3">
      <Container>
        <Navbar.Brand as={Link} to="/">
          REACT<span style={{color: '#6C63FF'}}>EVENTS</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/" active={location.pathname === '/'}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/events" active={location.pathname.includes('/event')}>
              Events
            </Nav.Link>
            <Nav.Link as={Link} to="/users" active={location.pathname.includes('/user')}>
              Community
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}