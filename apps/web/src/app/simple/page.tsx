export default function SimplePage() {
  return (
    <div style={{ padding: '40px', background: 'white', color: 'black' }}>
      <h1>Simple Test Page</h1>
      <p>If you can see this, the page is loading correctly.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}
