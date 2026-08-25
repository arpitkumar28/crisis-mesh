'use client';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🚨 CrisisMesh</h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered disaster intelligence, early-warning, and emergency response platform
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">📊 Monitoring</h2>
            <p className="text-gray-600">Real-time environmental data and IoT sensor networks</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">🤖 AI Intelligence</h2>
            <p className="text-gray-600">Predictive risk models and early-warning systems</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">🚨 Alerts</h2>
            <p className="text-gray-600">Real-time emergency notifications and management</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">🗺️ GIS</h2>
            <p className="text-gray-600">Geographic visualization and location intelligence</p>
          </div>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>PHASE 1 - Project Foundation</p>
          <p>Foundation established. Full features coming in subsequent phases.</p>
        </div>
      </div>
    </main>
  );
}
