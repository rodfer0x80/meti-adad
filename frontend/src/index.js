import React from 'react';
import ReactDOM from 'react-dom/client';

// Simple App Component
function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>ADAD Project Frontend</h2>
      <p>This is a test component running inside the Docker container.</p>
      <p>Go to the <code>/api/status</code> path (e.g., <code>http://localhost:8080/api/status</code>) to test the backend connection via NGINX!</p>
    </div>
  );
}

// Render the App component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

