import React, {useState, useEffect} from "react";
import { useParams, Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000"

export default function Event() {
  let params = useParams();
  let [event, setEvent] = useState(null);
  let [ratingData, setRatingData] = useState(null);

  const getEvent = async (id) => {
      try {
        const response = await fetch(`${API}/events/${id}`);
        const data = await response.json();
        setEvent(data);
      } catch (error) {
          console.error("Error fetching event", error);
      }
  }

  const getRating = async (id) => {
      try {
          const response = await fetch(`${API}/events/ratings/desc`);
          if (response.ok) {
              const result = await response.json();
              
              let list = [];
              if (Array.isArray(result)) {
                  list = result;
              } else if (result.data && Array.isArray(result.data)) {
                  list = result.data;
              }

              const match = list.find(item => item._id === id || item.id === id);
              
              if (match) {
                  setRatingData(match);
              }
          }
      } catch (error) {
          console.error("Error fetching ratings:", error);
      }
  }

  const renderStars = (score) => {
      const safeScore = Math.round(score || 0);
      return [...Array(5)].map((_, i) => (
          <i key={i} className={`bi ${i < safeScore ? 'bi-star-fill text-warning' : 'bi-star text-secondary'} me-1`}></i>
      ));
  };

  useEffect(() => {
    if(params.id) {
        getEvent(params.id);
        getRating(params.id);
    }
  }, [params.id]);

  if (!event) return <div className="container pt-5 text-center text-white">Loading Event Details...</div>;

  const score = ratingData?.avg_rating || ratingData?.avgScore || ratingData?.score || event.avgScore || 0;
  const count = ratingData?.review_count || ratingData?.reviewsCount || ratingData?.count || event.reviewsCount || 0;

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#121212', paddingBottom: '5rem'}}>
        {/* Header Background Image */}
        <div style={{
            height: '400px', 
            background: event.fotografia ? `url(${event.fotografia}) center/cover no-repeat` : '#1a1a1a',
            position: 'relative'
        }}>
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(18,18,18,0.3), #121212)'}}></div>
            <Container className="h-100 position-relative d-flex align-items-end pb-5">
                 <Link to="/events" className="btn btn-sm btn-dark position-absolute top-0 start-0 m-4 rounded-pill px-3 border border-secondary">
                    &larr; Back
                 </Link>
                 <div className="mb-4">
                     <span className="badge mb-3 px-3 py-2 rounded-pill fw-normal text-white" style={{backgroundColor: '#6C63FF', fontSize: '0.9rem'}}>
                        {event.tipologia}
                     </span>
                     <h1 className="display-4 fw-bold text-white mb-2">{event.nome_atividade}</h1>
                     
                     <div className="d-flex flex-wrap align-items-center gap-4 text-white-50 fs-5">
                         <div className="d-flex align-items-center">
                            <i className="bi bi-geo-alt me-2 text-purple"></i>{event.localizacao}
                         </div>
                         
                         {/* Rating Display */}
                         <div className="d-flex align-items-center border-start border-secondary ps-4">
                            <div className="d-flex me-2 text-warning fs-6">
                                {renderStars(score)}
                            </div>
                            <span className="text-white fw-bold">
                                {score > 0 ? Number(score).toFixed(1) : "N/A"}
                                <span className="text-white-50 fw-normal ms-2 fs-6">
                                    ({count} {count === 1 ? 'review' : 'reviews'})
                                </span>
                            </span>
                        </div>
                     </div>
                 </div>
            </Container>
        </div>

        <Container style={{marginTop: '-2rem'}}>
            <Row>
                <Col lg={8}>
                    <Card className="border-0 shadow-lg mb-4" style={{backgroundColor: '#1E1E1E'}}>
                        <Card.Body className="p-4 p-lg-5">
                            <h4 className="text-white mb-4">About this Event</h4>
                            
                            {/* Content Description */}
                            <div 
                                className="text-white lead fs-6" 
                                style={{ lineHeight: '1.8' }}
                                dangerouslySetInnerHTML={{ __html: event.sinopse || "<p>No description provided.</p>" }} 
                            />

                            {event.publico_destinatario && (
                                <div className="mt-5 p-4 rounded-3" style={{backgroundColor: '#252525'}}>
                                    <h6 className="text-white-50 text-uppercase small fw-bold mb-2">Target Audience</h6>
                                    <p className="text-white mb-0">{event.publico_destinatario}</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-lg mb-4 sticky-top" style={{backgroundColor: '#1E1E1E', top: '2rem'}}>
                        <Card.Body className="p-4">
                            <h5 className="text-white mb-4">Event Details</h5>
                            
                            <div className="d-flex align-items-center mb-4">
                                <div className="rounded-circle p-3 me-3" style={{backgroundColor: 'rgba(108, 99, 255, 0.1)'}}>
                                    <i className="bi bi-calendar-event text-purple fs-4"></i>
                                </div>
                                <div>
                                    <small className="text-secondary d-block">Date</small>
                                    <span className="text-white fw-bold">{event.data_inicio}</span>
                                </div>
                            </div>

                            <div className="d-flex align-items-center mb-4">
                                <div className="rounded-circle p-3 me-3" style={{backgroundColor: 'rgba(108, 99, 255, 0.1)'}}>
                                    <i className="bi bi-clock text-purple fs-4"></i>
                                </div>
                                <div>
                                    <small className="text-secondary d-block">Time</small>
                                    <span className="text-white fw-bold">{event.horario}</span>
                                </div>
                            </div>

                             <div className="d-flex align-items-center mb-4">
                                <div className="rounded-circle p-3 me-3" style={{backgroundColor: 'rgba(108, 99, 255, 0.1)'}}>
                                    <i className="bi bi-tag text-purple fs-4"></i>
                                </div>
                                <div>
                                    <small className="text-secondary d-block">Cost</small>
                                    <span className="text-white fw-bold">
                                        {event.custo === "" || event.custo === "Gratuito" ? "Free" : event.custo}
                                    </span>
                                </div>
                            </div>
                             
                             <div className="pt-3 border-top border-secondary">
                                 <small className="text-secondary d-block mb-1">Organized by</small>
                                 <span className="text-white">{event.organizacao}</span>
                             </div>

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    </div>
  )
}