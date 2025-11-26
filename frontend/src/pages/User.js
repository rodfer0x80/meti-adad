import React, {useState, useEffect, useCallback} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Badge from 'react-bootstrap/Badge';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000"

export default function User() {
  const params = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrichedRatings, setEnrichedRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);

  const fetchEventNames = useCallback(async (ratings) => {
      setLoadingRatings(true);
      try {
          const detailedRatings = await Promise.all(
              ratings.map(async (rating) => {
                  try {
                      const res = await fetch(`${API}/events/${rating.event_id}`);
                      const eventData = await res.json();
                      return {
                          ...rating, 
                          nome_atividade: eventData.nome_atividade,
                          _id: rating.event_id
                      };
                  } catch (err) {
                      return { 
                          ...rating, 
                          nome_atividade: "Event info unavailable", 
                          _id: rating.event_id 
                      };
                  }
              })
          );
          setEnrichedRatings(detailedRatings);
      } catch (error) {
          console.error("Error enriching ratings:", error);
      } finally {
          setLoadingRatings(false);
      }
  }, []); 

  const getUser = useCallback(async (id) => {
    try {
        const response = await fetch(`${API}/users/${id}`);
        if(response.ok) {
            const userData = await response.json();
            setUser(userData);
            
            // Prefer the backend's populated list, fallback to raw scores if needed
            let ratings = userData.top_rated_events;
            
            if (!ratings || ratings.length === 0) {
                 ratings = userData.event_scores || [];
                 if (ratings.length > 0) fetchEventNames(ratings);
            } else {
                setEnrichedRatings(ratings);
            }
        } else {
            console.error("User not found");
        }
    } catch (error) {
        console.error("Error fetching user:", error);
    }
  }, [fetchEventNames]); 

  const handleDelete = async () => {
      const confirmDelete = window.confirm("Are you sure? This cannot be undone.");
      if(!confirmDelete) return;

      try {
          const response = await fetch(`${API}/users/${params.id}`, {
              method: 'DELETE'
          });
          if(response.ok) {
              navigate('/users');
          }
      } catch (error) {
          console.error("Error deleting user:", error);
      }
  }

  const renderStars = (score) => {
      return [...Array(5)].map((_, i) => (
          <i key={i} className={`bi ${i < score ? 'bi-star-fill text-warning' : 'bi-star text-secondary'}`}></i>
      ));
  };

  useEffect(() => {
    if(params.id) getUser(params.id);
  }, [params.id, getUser]);

  if (!user) return <div className="container pt-5 text-center text-white">Loading User Profile...</div>;

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#121212', paddingBottom: '5rem'}}>
        {/* Professional Header Section */}
        <div className="py-5" style={{background: 'linear-gradient(to bottom, #1a1a1a, #121212)', borderBottom: '1px solid #1a1a1a'}}>
            <Container>
                 <Link to="/users" className="btn btn-sm btn-outline-secondary rounded-pill mb-4 px-3 border-secondary text-white-50">
                    &larr; Back to Community
                 </Link>
                 
                 <Row className="align-items-center">
                    <Col md={3} lg={2} className="text-center mb-4 mb-md-0">
                         {/* Gradient Avatar */}
                         <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-lg hover-jump" 
                              style={{
                                width: '130px', 
                                height: '130px', 
                                background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
                                border: '4px solid #121212'
                              }}>
                            <span className="text-white fw-bold display-3">{(user.nome || "U")[0].toUpperCase()}</span>
                        </div>
                    </Col>
                    <Col md={9} lg={10}>
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                            <div>
                                <h1 className="display-4 fw-bold text-white mb-2">{user.nome}</h1>
                                <div className="text-secondary mb-3 fs-5 d-flex align-items-center">
                                    <i className="bi bi-geo-alt me-2 text-purple"></i>
                                    {user.localizacao || "Unknown Location"}
                                </div>
                                <div className="d-flex gap-2 flex-wrap text-muted small">
                                     <Badge bg="dark" className="border border-secondary fw-normal px-2 py-1 text-white-50">
                                        ID: {user._id}
                                     </Badge>
                                     <Badge bg="dark" className="border border-secondary fw-normal px-2 py-1 text-white-50">
                                        Joined: {user.registo || "N/A"}
                                     </Badge>
                                </div>
                            </div>
                            <div className="mt-4 mt-md-0">
                                <Button variant="outline-danger" onClick={handleDelete} className="rounded-pill px-4 hover-jump">
                                    Delete Profile
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>

        <Container className="mt-4">
            <h3 className="text-white mb-4 ps-3 border-start border-4 border-primary">Event Activity</h3>
            
            {loadingRatings ? (
                <div className="text-secondary text-center py-5">Loading activity...</div>
            ) : enrichedRatings.length > 0 ? (
                <Row xs={1} md={2} lg={2} className="g-4">
                    {enrichedRatings.map((item, index) => (
                        <Col key={index}>
                            <Card className="h-100 border-0 shadow-sm hover-jump" style={{backgroundColor: '#1E1E1E', borderRadius: '12px'}}>
                                <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                                    <div className="pe-3 overflow-hidden">
                                        <div className="text-white-50 small mb-1 text-uppercase fw-bold" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>Rated Event</div>
                                        <Link 
                                            to={`/event/${item.event_id || item._id}`} 
                                            className="text-decoration-none fw-bold fs-5 text-purple hover-purple d-block text-truncate"
                                            title={item.nome_atividade || item.eventName}
                                        >
                                            {item.nome_atividade || item.eventName || "Event Name Loading..."} 
                                        </Link>
                                        <div className="text-secondary small mt-1 text-truncate">ID: {item.event_id || item._id}</div>
                                    </div>
                                    
                                    <div className="text-end ps-3 border-start border-secondary" style={{borderColor: '#333 !important', minWidth: '80px'}}>
                                        <div className="display-6 fw-bold text-warning">{item.score}</div>
                                        <div className="d-flex justify-content-end text-warning small" style={{fontSize: '0.6rem'}}>
                                            {renderStars(item.score)}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <div className="text-center p-5 border border-secondary rounded-3" style={{backgroundColor: '#1E1E1E', borderStyle: 'dashed !important', borderColor: '#333 !important'}}>
                    <i className="bi bi-stars text-secondary fs-1 mb-3 d-block"></i>
                    <p className="text-muted mb-0 fs-5">This user hasn't rated any events yet.</p>
                </div>
            )}
        </Container>
    </div>
  )
}