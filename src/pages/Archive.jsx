// ============================================================
// NULL//TRACE — Trace Archive Page
// Digital Museum of protocols, incidents, network nodes & artifacts
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import HTNButton from '../components/ui/HTNButton';
import Sparkle from '../components/ui/Sparkle';
import './Archive.css';

const CATEGORIES = [
  { id: 'ALL', label: 'ALL ARCHIVES' },
  { id: 'PROTOCOLS', label: 'NETWORK PROTOCOLS' },
  { id: 'INCIDENTS', label: 'SECURITY INCIDENTS' },
  { id: 'NODES', label: 'POLYNET NODES' },
  { id: 'ARTIFACTS', label: 'DECODED ARTIFACTS' },
];

const ARCHIVE_ITEMS = [
  // Network Protocols
  {
    id: 'proto-ssh',
    category: 'PROTOCOLS',
    categoryLabel: 'PROTOCOL',
    title: 'SSH-2.0 (Secure Shell)',
    code: 'PORT 22 // TCP',
    summary: 'Cryptographic network protocol for operating network services securely over an unsecured network.',
    threatLevel: 'SECURE',
    details: {
      standard: 'RFC 4253',
      vulnerability: 'Weak administrative credentials, exposed keys, brute-force dictionary assaults.',
      realWorld: 'Over 65% of automated internet scans target open SSH port 22 looking for default passwords.',
      defense: 'Disable password authentication; enforce ED25519 public key pairs, fail2ban rate limiting, and non-standard listening ports.',
    }
  },
  {
    id: 'proto-dns',
    category: 'PROTOCOLS',
    categoryLabel: 'PROTOCOL',
    title: 'DNS (Domain Name System)',
    code: 'PORT 53 // UDP/TCP',
    summary: 'Hierarchical naming system that translates human-readable domain names into numerical IP addresses.',
    threatLevel: 'VULNERABLE',
    details: {
      standard: 'RFC 1035',
      vulnerability: 'DNS spoofing/cache poisoning, DNS tunneling for covert exfiltration, reflection DDoS.',
      realWorld: 'Adversaries embed stolen data inside encoded subdomains (e.g. [base64].attacker.com) to bypass firewalls.',
      defense: 'Deploy DNSSEC (DNS Security Extensions) with cryptographic signing and strict egress DNS query filtering.',
    }
  },
  {
    id: 'proto-bgp',
    category: 'PROTOCOLS',
    categoryLabel: 'PROTOCOL',
    title: 'BGP (Border Gateway Protocol)',
    code: 'PORT 179 // TCP',
    summary: 'The routing protocol of the internet that exchanges routing and reachability information among autonomous systems (AS).',
    threatLevel: 'CRITICAL',
    details: {
      standard: 'RFC 4271',
      vulnerability: 'BGP route hijacking via malicious or erroneous prefix announcements.',
      realWorld: 'Accidental and targeted BGP route leaks have historically redirected massive financial and cloud provider traffic worldwide.',
      defense: 'Enforce RPKI (Resource Public Key Infrastructure) Route Origin Authorization (ROA) verification.',
    }
  },

  // Security Incidents
  {
    id: 'inc-01',
    category: 'INCIDENTS',
    categoryLabel: 'INCIDENT',
    title: 'Incident 0x01: Perimeter Breach',
    code: 'CASE #2026-0317A',
    summary: 'Unauthenticated dictionary spray against external workstation WS-01 resulting in interactive user shell.',
    threatLevel: 'ELEVATED',
    details: {
      standard: 'ATT&CK T1110 (Brute Force)',
      vulnerability: 'Single-factor authentication with standard dictionary password on engineering workstation.',
      realWorld: 'Credential spraying accounts for over 80% of successful corporate account takeovers.',
      defense: 'Universal Multi-Factor Authentication (MFA) via FIDO2 hardware tokens and contextual IP geolocation rules.',
    }
  },
  {
    id: 'inc-02',
    category: 'INCIDENTS',
    categoryLabel: 'INCIDENT',
    title: 'Incident 0x02: Subnet Route Hijack',
    code: 'CASE #2026-0317B',
    summary: 'Adversary injected poisoned ARP entries and manipulated subnet routing table to intercept server traffic.',
    threatLevel: 'HIGH',
    details: {
      standard: 'ATT&CK T1557 (Adversary-in-the-Middle)',
      vulnerability: 'Unsegmented local area network with zero dynamic ARP inspection.',
      realWorld: 'Allows silent eavesdropping and credential sniffing across identical switch broadcast domains.',
      defense: 'Implement 802.1X network access control, Dynamic ARP Inspection (DAI), and DHCP Snooping on all switchports.',
    }
  },
  {
    id: 'inc-03',
    category: 'INCIDENTS',
    categoryLabel: 'INCIDENT',
    title: 'Incident 0x03: SQL Injection Exfiltration',
    code: 'CASE #2026-0317C',
    summary: 'Blind SQL injection in administrative query interface dumped the hashed master credential table.',
    threatLevel: 'CRITICAL',
    details: {
      standard: 'OWASP Top 10 A03:2021-Injection',
      vulnerability: 'Dynamic string concatenation in SQL queries without parameterized input binding.',
      realWorld: 'SQL injection remains among the most destructive flaws, responsible for billions of leaked records.',
      defense: 'Strict parameterized queries (Prepared Statements), ORM abstractions, and least-privilege database user permissions.',
    }
  },

  // PolyNet Nodes
  {
    id: 'node-core',
    category: 'NODES',
    categoryLabel: 'INFRASTRUCTURE',
    title: 'CORE-01 (Primary Switch Matrix)',
    code: 'IP: 10.0.0.1 // OCTAGON',
    summary: 'High-throughput optical core switch bridging internal development subnets to administrative datastores.',
    threatLevel: 'CRITICAL',
    details: {
      standard: 'Tier-1 Backbone Fabric',
      vulnerability: 'Single point of failure if physical trunk links or administrative control plane is compromised.',
      realWorld: 'Core switch compromise allows total packet capture of unencrypted traffic across all VLANs.',
      defense: 'Out-of-band management network (OOBM), MACsec encryption on internal trunks, and redundant dual-supervisor modules.',
    }
  },
  {
    id: 'node-db',
    category: 'NODES',
    categoryLabel: 'INFRASTRUCTURE',
    title: 'DB-SRV (Vault Cluster)',
    code: 'IP: 10.0.3.50 // CYLINDER',
    summary: 'Relational data store hosting simulated customer identities, audit logs, and encrypted credentials.',
    threatLevel: 'HIGH',
    details: {
      standard: 'PostgreSQL 16 Cluster',
      vulnerability: 'Direct exposure to workstation VLAN without dedicated bastion or application proxy.',
      realWorld: 'Databases are the crown jewel of cyberattacks; attackers target them for ransomware or extortion.',
      defense: 'Strict firewall ingress limited solely to backend microservices; transparent data encryption at rest (TDE).',
    }
  },

  // Decoded Artifacts
  {
    id: 'art-payload',
    category: 'ARTIFACTS',
    categoryLabel: 'FORENSIC ARTIFACT',
    title: 'Bytecode: reverse_shell.bin',
    code: 'SHA-256: e3b0c44298fc1c149afb...',
    summary: 'Recovered position-independent shellcode injected into memory buffer during Mission 03.',
    threatLevel: 'MALICIOUS',
    details: {
      standard: 'x86_64 Position-Independent Code',
      vulnerability: 'Stack buffer overflow in legacy telemetry parser without stack canaries.',
      realWorld: 'Classic exploitation technique that forces execution flow to jump to attacker-supplied instructions.',
      defense: 'Enable modern compiler mitigations: ASLR (Address Space Layout Randomization), DEP/NX (No-Execute), and safe string libraries.',
    }
  },
  {
    id: 'art-incident-log',
    category: 'ARTIFACTS',
    categoryLabel: 'FORENSIC ARTIFACT',
    title: 'Syslog: auth_failure_cascade.log',
    code: 'FORMAT: RFC 5424 // 4.8 KB',
    summary: 'Time-correlated authentication failure logs exhibiting rapid password spraying behavior.',
    threatLevel: 'INVESTIGATED',
    details: {
      standard: 'SIEM Audit Export',
      vulnerability: 'Lack of automated account lockout allowed 47 rapid attempts within 3 minutes.',
      realWorld: 'Real-time SIEM alerts must ingest authentication logs to flag brute-force threshold anomalies.',
      defense: 'Continuous SIEM / SOAR rule triggers that quarantine originating IP addresses after 5 consecutive failures.',
    }
  },
];

export default function Archive() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeItem, setActiveItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const completedMissions = useGameStore(s => s.progress.completedMissions);

  const filteredItems = ARCHIVE_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="archive-page">
      <Sparkle size={20} color="var(--htn-yellow)" style={{ top: '80px', right: '8%' }} />
      <Sparkle size={14} color="var(--htn-mint)" style={{ bottom: '15%', left: '4%' }} />

      {/* Top Header */}
      <header className="archive-header">
        <div className="archive-header__inner">
          <div className="archive-header__left">
            <HTNButton variant="secondary" size="sm" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/menu'))}>
              ← BACK
            </HTNButton>
            <div className="archive-title-group">
              <span className="archive-badge">POLYNET DIGITAL ARCHIVES</span>
              <h1 className="archive-title">TRACE ARCHIVE</h1>
            </div>
          </div>
          <div className="archive-header__right">
            <span className="archive-counter">
              {ARCHIVE_ITEMS.length} DOSSIERS CATALOGED · {completedMissions.length}/5 MISSIONS CLEARED
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="archive-container">
        {/* Controls: Category tabs + Search bar */}
        <div className="archive-controls">
          <div className="archive-categories" role="tablist">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={selectedCategory === cat.id}
                className={`archive-cat-btn ${selectedCategory === cat.id ? 'archive-cat-btn--active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="archive-search">
            <span className="archive-search__icon">🔍</span>
            <input
              type="text"
              className="archive-search__input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search dossiers, protocols, CVEs..."
            />
            {searchQuery && (
              <button className="archive-search__clear" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>
        </div>

        {/* Dossier Grid */}
        <div className="archive-grid stagger-children">
          {filteredItems.map(item => (
            <article
              key={item.id}
              className="archive-card"
              onClick={() => setActiveItem(item)}
              tabIndex={0}
              role="button"
              onKeyDown={e => { if (e.key === 'Enter') setActiveItem(item); }}
            >
              <div className="archive-card__top">
                <span className="archive-card__cat">{item.categoryLabel}</span>
                <span className={`archive-card__threat archive-card__threat--${item.threatLevel.toLowerCase()}`}>
                  {item.threatLevel}
                </span>
              </div>
              <h3 className="archive-card__title">{item.title}</h3>
              <div className="archive-card__code">{item.code}</div>
              <p className="archive-card__summary">{item.summary}</p>
              <div className="archive-card__footer">
                <span>INSPECT DOSSIER</span>
                <span className="archive-card__arrow">→</span>
              </div>
            </article>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="archive-empty">
            <div className="archive-empty__icon">◈</div>
            <h3>NO DOSSIERS MATCH QUERY</h3>
            <p>Try resetting category filters or search parameters.</p>
          </div>
        )}
      </div>

      {/* Immersive Detail Modal */}
      {activeItem && (
        <div className="archive-modal" role="dialog" aria-modal="true" onClick={() => setActiveItem(null)}>
          <div className="archive-modal__panel" onClick={e => e.stopPropagation()}>
            <div className="archive-modal__header">
              <div className="archive-modal__badge-row">
                <span className="tag tag--accent">{activeItem.categoryLabel}</span>
                <span className="archive-card__code">{activeItem.code}</span>
              </div>
              <h2 className="archive-modal__title">{activeItem.title}</h2>
              <p className="archive-modal__summary">{activeItem.summary}</p>
            </div>

            <div className="archive-modal__body">
              <div className="archive-modal__section">
                <h4>VULNERABILITY & EXPLOITATION VECTOR</h4>
                <p>{activeItem.details.vulnerability}</p>
              </div>

              <div className="archive-modal__section">
                <h4>REAL-WORLD CYBERSECURITY PRECEDENT</h4>
                <p>{activeItem.details.realWorld}</p>
              </div>

              <div className="archive-modal__section archive-modal__section--defense">
                <h4>RECOMMENDED HARDENING & DEFENSIVE STRATEGY</h4>
                <p>{activeItem.details.defense}</p>
              </div>
            </div>

            <div className="archive-modal__footer">
              <HTNButton variant="mint" size="md" className="w-full" onClick={() => setActiveItem(null)}>
                CLOSE DOSSIER
              </HTNButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
