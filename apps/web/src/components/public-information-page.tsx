import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function PublicInformationPage({ title, eyebrow, description, cards }: { title: string; eyebrow: string; description: string; cards: Array<{ title: string; text: string; href?: string }> }) {
  return <main className="public-app">
    <header className="public-header"><Link className="public-brand" href="/"><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 12, overflow: 'hidden', background: '#edf4ff' }}><Image src="/brand/crisismesh-icon.png" alt="CrisisMesh logo" width={38} height={38} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div><span>CRISIS<b>MESH</b><small>Resilient Disaster Intelligence</small></span></Link><nav><Link href="/">Home</Link><Link href="/map">Live Map</Link><Link href="/districts">Districts</Link><Link href="/alerts">Alerts</Link><Link href="/news">News</Link><Link href="/safety">Safety</Link><Link href="/resources">Resources</Link><Link href="/about">About</Link></nav><div className="header-actions"><Link href="/login">Login / Sign Up</Link></div></header>
    <div className="live-alert"><b>LIVE ALERT</b><span>National disaster intelligence monitoring is active</span><Link href="/alerts">View alerts <ArrowRight size={15} /></Link></div>
    <section style={{padding:'62px max(28px, 8vw)',background:'linear-gradient(125deg,#031936,#0757e8)',color:'#fff'}}><p style={{margin:'0 0 12px',color:'#b8d1ff',fontSize:12,fontWeight:800,letterSpacing:1.2,textTransform:'uppercase'}}>{eyebrow}</p><h1 style={{maxWidth:680,margin:0,fontSize:44,letterSpacing:-1.5}}>{title}</h1><span style={{display:'block',maxWidth:650,marginTop:17,color:'#e3efff',lineHeight:1.6}}>{description}</span></section>
    <section style={{display:'grid',gridTemplateColumns:'repeat(3, minmax(0, 1fr))',gap:16,padding:28,background:'#f6f9ff'}}>{cards.map((card) => <article key={card.title} style={{padding:23,border:'1px solid #e0e8f3',borderRadius:12,background:'#fff'}}><h2 style={{margin:0,fontSize:17}}>{card.title}</h2><p style={{minHeight:54,color:'#60708a',fontSize:13,lineHeight:1.55}}>{card.text}</p>{card.href && <Link style={{display:'inline-flex',alignItems:'center',gap:5,color:'#0757e8',fontSize:12,fontWeight:800,textDecoration:'none'}} href={card.href}>Open <ArrowRight size={15} /></Link>}</article>)}</section>
    <footer className="public-footer">crisismesh — Building a safer and more resilient India.<span>Privacy · Terms · Support</span></footer>
  </main>;
}
