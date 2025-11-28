import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

export default function EventCard(props) {
    const { 
        _id, 
        nome_atividade, 
        tipologia, 
        data_inicio, 
        localizacao, 
        custo,
        fotografia 
    } = props;

    const formatDate = (dateString) => {
        if(!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    return (
        <Col className="mb-4">
            <Card className="h-100 border-0 shadow-lg hover-jump" style={{backgroundColor: '#1E1E1E', borderRadius: '16px'}}>
                <Link to={`/event/${_id}`} className="text-decoration-none">
                    {/* Image Area */}
                    <div style={{height: '200px', overflow: 'hidden', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', position: 'relative'}}>
                        {fotografia ? (
                            <Card.Img variant="top" src={fotografia} style={{objectFit: 'cover', height: '100%', width: '100%'}} />
                        ) : (
                             <div className="d-flex align-items-center justify-content-center h-100 bg-dark text-secondary">
                                <i className="bi bi-calendar-event" style={{fontSize: '3rem', opacity: 0.3}}></i>
                             </div>
                        )}
                        
                        {/* Date Badge */}
                        <div className="position-absolute top-0 end-0 m-3">
                             <span className="badge bg-dark text-white border border-secondary shadow-sm py-2 px-3">
                                {formatDate(data_inicio)}
                             </span>
                        </div>
                    </div>
                </Link>

                <Card.Body className="d-flex flex-column p-4">
                    <div className="mb-2">
                         <span className="text-uppercase fw-bold" style={{fontSize: '0.7rem', color: '#6C63FF', letterSpacing: '1px'}}>
                            {tipologia}
                         </span>
                    </div>
                    
                    <Link to={`/event/${_id}`} className="text-decoration-none">
                        <Card.Title className="mb-3 fs-5 text-white event-title-truncate hover-purple">
                            {nome_atividade}
                        </Card.Title>
                    </Link>
                    
                    <div className="mt-auto">
                        <div className="d-flex align-items-center mb-3 text-secondary small">
                            <i className="bi bi-geo-alt me-2 text-purple"></i>
                            <span className="text-truncate">{localizacao}</span>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center border-top border-secondary pt-3 mt-2" style={{borderColor: '#333 !important'}}>
                            <span className="fw-bold text-white small">
                                {custo === "" || custo === "Gratuito" ? "Free" : custo}
                            </span>
                            <Link to={`/event/${_id}`}>
                                <Button 
                                    size="sm" 
                                    className="rounded-pill px-3 fw-bold"
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
                                    Explore &rarr;
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Col>
    );
}