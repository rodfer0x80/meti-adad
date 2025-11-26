import React, {useState, useEffect} from "react";
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import EventCard from "../components/EventCard";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000"

export default function Events() {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6; 

  const getEvents = async (pageNumber) => {
    try {
      const response = await fetch(`${API}/events?page=${pageNumber}&limit=${limit}`);
      const result = await response.json();
      
      if (result.data && Array.isArray(result.data)) {
        setEvents(result.data);
        setTotalPages(result.totalPages || 1);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
    }
  }

  useEffect(() => {
    getEvents(page);
  }, [page]);

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#121212', paddingBottom: '5rem'}}>
        {/* Page Header */}
        <div className="py-5 mb-4" style={{background: 'linear-gradient(to bottom, #1a1a1a, #121212)'}}>
            <Container className="text-center">
                <h1 className="display-4 fw-bold text-white mb-3">
                    Discover <span className="text-purple">Events</span>
                </h1>
                <p className="lead text-secondary mx-auto" style={{maxWidth: '600px'}}>
                    Browse the latest happenings, from local meetups to major conferences.
                </p>
            </Container>
        </div>

        <Container>
            {/* Pagination Controls */}
            <div className="d-flex justify-content-between align-items-center mb-5 px-2">
                <Button 
                    variant="outline-secondary" 
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="rounded-pill px-4"
                >
                    &larr; Previous
                </Button>
                <span className="text-secondary small fw-bold tracking-wide">
                   PAGE {page} OF {totalPages}
                </span>
                <Button 
                    variant="outline-secondary" 
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="rounded-pill px-4"
                >
                    Next &rarr;
                </Button>
            </div>

            <Row xs={1} md={2} lg={3} className="g-4">
            {events && events.length > 0 ? (
                events.map((event) => (
                    <EventCard key={event._id} {...event} />
                ))
            ) : (
                <div className="text-center w-100 py-5">
                    <h3 className="text-muted">No events found.</h3>
                </div>
            )}
            </Row>
        </Container>
    </div>
  )
}