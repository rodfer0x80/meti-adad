import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000"

export default function Users() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  const getUsers = async (pageNumber) => {
    try {
        const response = await fetch(`${API}/users?page=${pageNumber}&limit=${limit}`);
        const result = await response.json();
        
        if (result.data && Array.isArray(result.data)) {
            setUsers(result.data);
            setTotalPages(result.totalPages || 1);
        } else {
            setUsers([]);
        }
    } catch(err) {
        console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    getUsers(page);
  }, [page]);

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#121212', paddingBottom: '5rem'}}>
      {/* Page Header */}
      <div className="py-5 mb-4" style={{background: 'linear-gradient(to bottom, #1a1a1a, #121212)'}}>
        <Container className="text-center">
           <h1 className="display-4 fw-bold text-white mb-3">
            Meet the <span className="text-purple">Community</span>
           </h1>
           <p className="lead text-secondary mx-auto" style={{maxWidth: '600px'}}>
             Connect with other event enthusiasts, see what they are attending, and compare ratings.
           </p>
        </Container>
      </div>

      <Container>
        {/* Pagination Controls - Top */}
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

        {/* Users Grid */}
        <Row xs={1} md={2} lg={3} className="g-4">
            {users.map((user) => (
                <Col key={user._id}>
                    <Card className="h-100 border-0 shadow-lg hover-jump" style={{backgroundColor: '#1E1E1E', borderRadius: '16px'}}>
                        <Card.Body className="p-4 d-flex flex-column align-items-center text-center">
                            
                            {/* Avatar with Gradient */}
                            <div className="mb-4 rounded-circle d-flex align-items-center justify-content-center" 
                                 style={{
                                    width: '80px', 
                                    height: '80px', 
                                    background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
                                    boxShadow: '0 10px 20px rgba(108, 99, 255, 0.2)'
                                 }}>
                                <span className="text-white fw-bold display-6">
                                    {(user.nome || "U")[0].toUpperCase()}
                                </span>
                            </div>

                            <Card.Title className="h4 text-white mb-1">
                                {user.nome || "Unknown User"}
                            </Card.Title>
                            
                            <p className="text-secondary mb-4 small">
                                <i className="bi bi-geo-alt me-1 text-purple"></i> 
                                {user.localizacao || "Location N/A"}
                            </p>

                            <div className="mt-auto w-100">
                                <Link to={`/user/${user._id}`}>
                                    <Button 
                                        className="w-100 rounded-pill py-2 fw-bold"
                                        style={{
                                            backgroundColor: '#252525', 
                                            color: 'white', 
                                            border: '1px solid #333'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#6C63FF';
                                            e.currentTarget.style.borderColor = '#6C63FF';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = '#252525';
                                            e.currentTarget.style.borderColor = '#333';
                                        }}
                                    >
                                        View Profile
                                    </Button>
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
      </Container>
    </div>
  )
}