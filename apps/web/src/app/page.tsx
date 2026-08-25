export default function Home() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>🚨 CrisisMesh</h1>
        <p style={{ fontSize: '20px', color: '#666', marginBottom: '32px' }}>
          AI-powered disaster intelligence, early-warning, and emergency response platform
        </p>

        <div style={{ marginTop: '48px', fontSize: '14px', color: '#888' }}>
          <p>PHASE 1 - Project Foundation</p>
          <p>Foundation established. Full features coming in subsequent phases.</p>
        </div>
      </div>
    </main>
  );
}
