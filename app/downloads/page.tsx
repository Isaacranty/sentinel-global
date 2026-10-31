import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";

const CONFIG_REPO = [
    {
        category: "Routing Labs",
        files: [
            { name: "OSPF & BGP Dynamic Lab", path: "/configs/routing/global_ospf_lab.gns3", desc: "GNS3 Topology for multi-area routing practice." },
            { name: "IPv6 OSPF Tunneling", path: "/configs/labs/ipv6ip_ospf.pkt", desc: "Packet Tracer: IPv6 over IPv4 OSPF tunneling." },
            { name: "OSPF/BGP Config", path: "/configs/routing/ospf_bgp.cfg", desc: "Tactical dynamic routing baseline." },
            { name: "Static & Default Routes", path: "/configs/routing/static_default_routing.cfg", desc: "Gateway and manual route persistence." }
        ]
    },
    {
        category: "Cybersecurity Labs",
        files: [
            { name: "IPsec Site-to-Site", path: "/configs/labs/Ipsec.pkt", desc: "Packet Tracer: Hardened IPsec VPN implementation." },
            { name: "AAA Radius Authentication", path: "/configs/labs/AAA_Radius_Server.pkt", desc: "Packet Tracer: Centralized identity management." },
            { name: "Zone Based Firewall (ZFW)", path: "/configs/labs/ZFW.pkt", desc: "Packet Tracer: Advanced perimeter security logic." },
            { name: "802.1X Wired Security", path: "/configs/labs/wired dot1x.pkt", desc: "Packet Tracer: Port-based Network Access Control." }
        ]
    },
    {
        category: "ASA & Edge Security",
        files: [
            { name: "ASA ACL & NAT", path: "/configs/labs/asa_acl_nat.pkt", desc: "Packet Tracer: Cisco ASA firewall baseline." },
            { name: "ASA Clientless VPN", path: "/configs/labs/asa_clientless_vpn.pkt", desc: "Packet Tracer: Remote access SSL VPN." },
            { name: "Advanced NAT (Outside)", path: "/configs/labs/Outside_Nat.pkt", desc: "Packet Tracer: Complex NAT translation scenarios." }
        ]
    },
    {
        category: "Implementation Guides",
        files: [
            { name: "Lab Usage Manual", path: "/configs/HOW_TO_USE_LABS.md", desc: "Instructions for using these assets in Packet Tracer & GNS3." }
        ]
    },
    {
        category: "Switching",
        files: [
            { name: "VLAN & STP Logic", path: "/configs/switching/vlan_stp.cfg", desc: "Logical segmentation and loop prevention." }
        ]
    },
    {
        category: "Infrastructure Services",
        files: [
            { name: "DHCP, SNMP & SSH", path: "/configs/services/dhcp_snmp.cfg", desc: "Automation and remote management baselines." },
            { name: "DHCP Relay Agent", path: "/configs/services/dhcp_relay.cfg", desc: "Cross-subnet address allocation." },
            { name: "High Availability (HSRP/VRRP)", path: "/configs/services/redundancy.cfg", desc: "Gateway redundancy and failover." },
            { name: "Quality of Service (QoS)", path: "/configs/services/qos.cfg", desc: "Traffic policing and prioritization." }
        ]
    }
];

export default function DownloadsPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="font-mono text-xl tracking-tight mb-2 uppercase text-signal">Tactical Asset Repository</h1>
        <p className="text-text-muted text-sm mb-10 font-mono uppercase tracking-widest text-[10px]">
          [ Ready-to-run labs and configuration files for local practice ]
        </p>

        <div className="grid gap-10">
            {CONFIG_REPO.map(cat => (
                <section key={cat.category}>
                    <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted mb-4 border-l-2 border-signal/40 pl-3">{cat.category}</h2>
                    <div className="grid gap-4">
                        {cat.files.map(file => (
                            <div key={file.name} className="bg-panel border border-panelLine p-5 rounded-sm flex items-center justify-between group hover:border-signal/40 transition-colors">
                                <div>
                                    <h3 className="text-sm font-bold group-hover:text-signal transition-colors">{file.name}</h3>
                                    <p className="text-[11px] text-text-muted font-mono mt-1">{file.desc}</p>
                                </div>
                                <a
                                    href={file.path}
                                    download
                                    className="bg-ink border border-panelLine px-4 py-2 text-[10px] font-mono text-text hover:bg-signal hover:text-ink transition-all uppercase tracking-tighter"
                                >
                                    DOWNLOAD
                                </a>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>

        <div className="mt-20 p-8 border border-dashed border-panelLine rounded-sm bg-panel/20 text-center">
            <h4 className="text-xs font-mono uppercase text-text mb-2">Operational Directive</h4>
            <p className="text-[10px] text-text-muted font-mono leading-relaxed max-w-lg mx-auto">
                These assets are verified for Packet Tracer 8.x+ and GNS3 2.2+. Use them to mirror the global architecture in your local sector.
            </p>
        </div>
      </div>
    </main>
  );
}
