import React from "react";
import { Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

export default function Home() {
  return (
    <React.Fragment>
      <div className="d-flex align-items-center justify-content-center text-center position-relative overflow-hidden" 
           style={{ minHeight: '90vh', background: 'radial-gradient(circle at center, #1a1a1a 0%, #121212 80%)' }}>
        
        {/* Decorative Background Glows */}
        <div style={{position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%', background: '#6C63FF', filter: 'blur(150px)', opacity: '0.1', borderRadius: '50%', pointerEvents: 'none'}}></div>
        <div style={{position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: '#FF6584', filter: 'blur(150px)', opacity: '0.1', borderRadius: '50%', pointerEvents: 'none'}}></div>

        <Container style={{position: 'relative', zIndex: 2}}>
          <h1 className="display-1 fw-bold mb-4 text-white" style={{letterSpacing: '-2px', fontSize: '4.5rem'}}>
            React<span className="text-purple">Events</span>
          </h1>
          <p className="lead text-secondary mb-5 mx-auto fs-4" style={{maxWidth: '750px', lineHeight: '1.6', fontWeight: '300'}}>
            The most platform to discover upcoming events and connect with a the community.
          </p>
          
          <div className="d-flex justify-content-center gap-3">
            <Link to="/events">
              <Button size="lg" className="btn-primary px-5 py-3 fs-5 rounded-pill shadow-lg hover-jump border-0">
                Events
              </Button>
            </Link>
            <Link to="/users">
              <Button variant="outline-light" size="lg" className="px-5 py-3 fs-5 rounded-pill hover-jump" style={{borderWidth: '2px'}}>
                Community
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      <div className="py-5" style={{backgroundColor: '#0F0F0F'}}>
        <Container>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 border-0 bg-transparent">
                <Card.Body className="p-4 rounded-4" style={{backgroundColor: '#1E1E1E', border: '1px solid #333', transition: '0.3s'}}>
                  <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle" style={{width: '60px', height: '60px', backgroundColor: 'rgba(255, 101, 132, 0.1)'}}>
                    <i className="bi bi-collection-play text-danger fs-3"></i>
                  </div>
                  <h3 className="h4 fw-bold text-white mb-3">Events</h3>
                  <p className="text-secondary mb-0" style={{lineHeight: '1.6'}}>
                    The best events are aggregated based on ratings and popularity so you never miss out on what's happening nearby.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 bg-transparent">
                 <Card.Body className="p-4 rounded-4" style={{backgroundColor: '#1E1E1E', border: '1px solid #333'}}>
                  <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle" style={{width: '60px', height: '60px', backgroundColor: 'rgba(108, 99, 255, 0.1)'}}>
                    <i className="bi bi-people text-primary fs-3"></i>
                  </div>
                  <h3 className="h4 fw-bold text-white mb-3">Community</h3>
                  <p className="text-secondary mb-0" style={{lineHeight: '1.6'}}>
                    Create your profile, rate events, and connect with the community to see what's happening in your local area.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
               <Card className="h-100 border-0 bg-transparent">
                 <Card.Body className="p-4 rounded-4" style={{backgroundColor: '#1E1E1E', border: '1px solid #333'}}>
                  <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle" style={{width: '60px', height: '60px', backgroundColor: 'rgba(76, 217, 100, 0.1)'}}>
                    <i className="bi bi-lightning-charge text-success fs-3"></i>
                  </div>
                  <h3 className="h4 fw-bold text-white mb-3">Connect</h3>
                  <p className="text-secondary mb-0" style={{lineHeight: '1.6'}}>
                    Get the latest information on schedules, locations, and attendees.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  )
}