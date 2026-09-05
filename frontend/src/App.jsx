import { useEffect, useState } from 'react';

function App() {
  const [apiStatus, setApiStatus] = useState('Checking API...');

  useEffect(() => {
    fetch('/api/health')
      .then((response) => {
        if (!response.ok) {
          throw new Error('API request failed');
        }
        return response.json();
      })
      .then((data) => setApiStatus(data.message))
      .catch(() => setApiStatus('API is offline. Start the backend server.'));
  }, []);

  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">FurniLedger</p>
        <h1>Furniture inventory, ready to build.</h1>
        <p className="intro">
          Your React frontend and Express backend are connected and ready for the next feature.
        </p>
        <div className="status" role="status">
          <span className="status-dot" />
          {apiStatus}
        </div>
      </section>
    </main>
  );
}

export default App;
