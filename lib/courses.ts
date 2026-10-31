export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
};

export type TerminalCommand = {
    cmd: string;
    response: string;
};

export type Lesson = {
  id: string;
  title: string;
  content: string; // Markdown content
  quiz?: QuizQuestion[];
  terminal?: {
      initialPath?: string;
      commands: TerminalCommand[];
  };
  downloadUrl?: string; // Link to download config file
};

export type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  lessons: Lesson[];
};

export const COURSES: Course[] = [
  {
    id: "intro-to-osint",
    title: "OSINT Foundations",
    description: "Learn the art of Open Source Intelligence from scratch.",
    category: "OSINT",
    lessons: [
      {
        id: "what-is-osint",
        title: "What is OSINT?",
        content: `
# What is OSINT?

Open Source Intelligence (OSINT) is the collection and analysis of data gathered from open sources to produce actionable intelligence.

## Common Sources:
- Social Media
- Public Records
- News Reports
- Digital Footprints

In this course, we will explore tools and techniques to gather data effectively while staying anonymous.
        `,
        quiz: [
            {
                id: "q1",
                question: "What does OSINT stand for?",
                options: [
                    "Open Source Internal Network",
                    "Open Systems Intelligence Network",
                    "Open Source Intelligence",
                    "Official Security Intelligence Network"
                ],
                correctAnswer: 2
            }
        ]
      },
      {
        id: "google-dorking",
        title: "Google Dorking Mastery",
        content: `
# Google Dorking

Google Dorking, also known as Google Hacking, involves using advanced search operators to find information that isn't easily accessible.

## Useful Operators:
- \`site:\` - Search within a specific website.
- \`filetype:\` - Search for specific file extensions (e.g., pdf, xls).
- \`inurl:\` - Find strings within the URL.
- \`intitle:\` - Find strings within the page title.

### Example:
\`site:gov filetype:pdf "confidential"\`
        `,
        quiz: [
            {
                id: "q1",
                question: "Which operator is used to search for a specific file type?",
                options: ["ext:", "type:", "filetype:", "format:"],
                correctAnswer: 2
            },
            {
                id: "q2",
                question: "What would 'intitle:index of' often reveal?",
                options: [
                    "A list of Google employees",
                    "Exposed directory listings on a server",
                    "A website's homepage only",
                    "Encrypted database files"
                ],
                correctAnswer: 1
            }
        ]
      }
    ]
  },
  {
      id: "network-recon",
      title: "Network Reconnaissance",
      description: "Map out infrastructure like a pro using Nmap and more.",
      category: "Network",
      lessons: [
          {
              id: "nmap-basics",
              title: "Nmap Basics",
              content: "# Nmap Basics\n\nNmap is a powerful network scanner used to discover hosts and services. Try scanning the target below using the terminal lab.\n\n### Mission:\nExecute `nmap -sV 10.0.0.5` to find the service version on the target machine.",
              terminal: {
                  initialPath: "/root/recon",
                  commands: [
                      {
                          cmd: "nmap -sV 10.0.0.5",
                          response: "Starting Nmap 7.92...\nNmap scan report for 10.0.0.5\nHost is up (0.001s latency).\nPORT   STATE SERVICE VERSION\n80/tcp open  http    Apache httpd 2.4.41\n\nService detection performed. Please report findings."
                      }
                  ]
              },
              quiz: [
                  {
                      id: "q1",
                      question: "Which Nmap flag is used for Service Version Detection?",
                      options: ["-sS", "-sV", "-O", "-A"],
                      correctAnswer: 1
                  }
              ]
          }
      ]
  },
  {
    id: "global-networking",
    title: "Global Network Engineering",
    description: "Master enterprise routing, switching, and tactical security configurations.",
    category: "Network",
    lessons: [
      {
        id: "routing-protocols",
        title: "Tactical Routing: OSPF & BGP",
        content: `
# Enterprise Routing

In this module, we explore high-availability routing protocols used to synchronize intelligence across global nodes.

## OSPF (Open Shortest Path First)
A link-state routing protocol used within an autonomous system. It uses the SPF algorithm to find the shortest path.

## BGP (Border Gateway Protocol)
The protocol that makes the internet work. It manages how packets are routed across the internet through the exchange of routing and reachability information between edge routers.

### Tactical Reference:
Reference configurations can be found in \`infra/networking/routing/ospf_bgp.cfg\`.
        `,
        downloadUrl: "/configs/routing/ospf_bgp.cfg",
        terminal: {
            initialPath: "Router#",
            commands: [
                {
                    cmd: "show ip ospf neighbor",
                    response: "Neighbor ID     Pri   State           Dead Time   Address         Interface\n10.0.0.2          1   FULL/DR         00:00:34    10.0.0.2        GigabitEthernet0/1"
                },
                {
                    cmd: "show ip bgp summary",
                    response: "BGP router identifier 10.0.0.1, local AS number 65001\nNeighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd\n1.1.1.1         4        65002      42      45       12    0    0 02:14:05        1"
                }
            ]
        },
        quiz: [
          {
            id: "q1",
            question: "Which protocol is primarily used for routing between different Autonomous Systems (AS)?",
            options: ["OSPF", "EIGRP", "BGP", "RIP"],
            correctAnswer: 2
          }
        ]
      },
      {
        id: "switching-vlan",
        title: "Network Segmentation: VLANs & STP",
        content: `
# Network Segmentation

Segmenting your network is critical for isolating threats and optimizing traffic flow.

## VLANs (Virtual LANs)
VLANs allow you to logically separate a physical switch into multiple broadcast domains.

## STP (Spanning Tree Protocol)
STP prevents loops in networks with redundant links by selectively blocking ports.

### Tactical Reference:
Reference configurations can be found in \`infra/networking/switching/vlan_stp.cfg\`.
        `,
        downloadUrl: "/configs/switching/vlan_stp.cfg",
        terminal: {
            initialPath: "Switch#",
            commands: [
                {
                    cmd: "show vlan brief",
                    response: "VLAN Name                             Status    Ports\n---- -------------------------------- --------- -------------------------------\n1    default                          active    Gi0/1, Gi0/2\n10   SALES                            active    Gi0/3\n20   ENGINEERING                      active    Gi0/4"
                }
            ]
        },
        quiz: [
            {
                id: "q1",
                question: "What is the primary purpose of STP?",
                options: ["Speed up traffic", "Prevent network loops", "Assign IP addresses", "Filter web traffic"],
                correctAnswer: 1
            }
        ]
      },
      {
          id: "network-security",
          title: "Infrastructure Defense: ACLs & NAT",
          content: `
# Infrastructure Defense

Protecting the perimeter requires granular control over traffic flow and identity.

## ACLs (Access Control Lists)
Filters traffic based on source/destination IP, port, and protocol.

## NAT (Network Address Translation)
Maps private internal addresses to a public external address, conserving IPv4 space and providing a layer of obfuscation.

### Tactical Reference:
Reference configurations can be found in \`infra/networking/security/acl_nat_vpn.cfg\`.
          `,
          downloadUrl: "/configs/security/acl_nat_vpn.cfg",
          quiz: [
              {
                  id: "q1",
                  question: "What does NAT 'Overload' (PAT) allow?",
                  options: [
                      "Multiple internal hosts to share one public IP",
                      "Increased encryption speed",
                      "Automatic VLAN assignment",
                      "Blocking all incoming traffic"
                  ],
                  correctAnswer: 0
              }
          ]
      },
      {
        id: "lan-configuration",
        title: "LAN Configuration",
        content: `
# LAN Configuration

A Local Area Network connects devices within a single site. This lab covers bringing up a router and access-layer switch to serve a wired LAN segment.

## Key Commands
- \`interface GigabitEthernet0/0\` then \`ip address ... / no shutdown\` on the router
- \`interface vlan 1\` on the switch, for management IP
- \`ip default-gateway\` on the switch so it's reachable for management

### Tactical Reference:
Reference configuration in \`infra/networking/basics/lan_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/basics/lan_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "On a Layer 2 switch, what interface do you configure to give it a management IP address?",
            options: ["interface GigabitEthernet0/0", "interface vlan 1", "interface loopback 0", "interface port-channel 1"],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "wan-configuration",
        title: "WAN Configuration",
        content: `
# WAN Configuration

A Wide Area Network link connects two sites over a serial (or similar) link, simulating an ISP or leased-line connection between an HQ and a branch router.

## Key Concepts
- The DCE end of a serial link supplies clocking (\`clock rate\`)
- \`encapsulation ppp\` is the modern default over HDLC for interoperability
- Each site still needs a route back to the other site's LAN

### Tactical Reference:
Reference configuration in \`infra/networking/basics/wan_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/basics/wan_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "Which side of a serial WAN link must set the 'clock rate' command?",
            options: ["The DTE end", "The DCE end", "Both ends", "Neither, it's automatic"],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "vlan-configuration",
        title: "VLAN Configuration",
        content: `
# VLAN Configuration

VLANs split a single physical switch into multiple logical broadcast domains, isolating traffic between departments like Sales and IT even though they share the same hardware.

## Key Commands
- \`vlan <id>\` / \`name <name>\` to create a VLAN
- \`switchport access vlan <id>\` on access ports
- \`switchport mode trunk\` + \`switchport trunk allowed vlan\` to carry multiple VLANs on one link

### Tactical Reference:
Reference configuration in \`infra/networking/switching/vlan_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/switching/vlan_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "What command assigns a switch access port to VLAN 20?",
            options: ["switchport vlan 20", "switchport access vlan 20", "vlan 20 assign", "interface vlan 20"],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "intervlan-routing",
        title: "Inter-VLAN Routing Configuration",
        content: `
# Inter-VLAN Routing

VLANs are isolated by design, so a router (or Layer 3 switch) is needed for hosts in different VLANs to talk to each other. This lab uses the classic "router-on-a-stick" method with subinterfaces.

## Key Commands
- \`interface GigabitEthernet0/0.10\` + \`encapsulation dot1Q 10\` creates a subinterface for VLAN 10
- Each subinterface gets its own IP, acting as that VLAN's default gateway
- Alternative: \`ip routing\` + SVIs (\`interface vlan 10\`) on a Layer 3 switch

### Tactical Reference:
Reference configuration in \`infra/networking/switching/intervlan_routing_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/switching/intervlan_routing_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "In router-on-a-stick, what does 'encapsulation dot1Q 10' on a subinterface do?",
            options: [
              "Encrypts traffic for VLAN 10",
              "Tags the subinterface to handle traffic for VLAN 10",
              "Creates VLAN 10 on the switch",
              "Sets the port speed to 10 Mbps"
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "static-routing",
        title: "Static Routing Configuration",
        content: `
# Static Routing

Static routes are manually configured paths to remote networks — precise, predictable, and ideal for small or simple topologies where routes don't change often.

## Key Command
\`ip route <destination-network> <subnet-mask> <next-hop-or-exit-interface>\`

### Tactical Reference:
Reference configuration in \`infra/networking/routing/static_routing_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/routing/static_routing_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "What is the main drawback of static routing compared to dynamic routing protocols?",
            options: [
              "It requires more CPU",
              "It doesn't automatically adapt to topology changes",
              "It cannot route between subnets",
              "It only works over serial links"
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "default-routing",
        title: "Default Routing Configuration",
        content: `
# Default Routing

A default route is the "route of last resort" — it catches any traffic that doesn't match a more specific entry in the routing table. It's especially useful on stub routers with only one way out, like a branch office.

## Key Command
\`ip route 0.0.0.0 0.0.0.0 <next-hop>\`

### Tactical Reference:
Reference configuration in \`infra/networking/routing/default_routing_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/routing/default_routing_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "A default route is best suited for which type of site?",
            options: [
              "A core datacenter router with many paths",
              "A stub branch router with a single uplink",
              "An internet backbone router",
              "A switch with no Layer 3 capability"
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "ospf-configuration",
        title: "OSPF Configuration",
        content: `
# OSPF (Open Shortest Path First)

OSPF is a link-state routing protocol that builds a full map of the network topology and uses Dijkstra's SPF algorithm to calculate the shortest path to every network, all within a single autonomous system.

## Key Commands
- \`router ospf <process-id>\`
- \`network <network> <wildcard-mask> area <area-id>\`
- \`passive-interface\` to stop OSPF hellos on LAN-facing interfaces

### Tactical Reference:
Reference configuration in \`infra/networking/routing/ospf_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/routing/ospf_full_lab.cfg",
        terminal: {
            initialPath: "Router#",
            commands: [
                {
                    cmd: "show ip ospf neighbor",
                    response: "Neighbor ID     Pri   State           Dead Time   Address         Interface\n2.2.2.2           1   FULL/ -        00:00:38    10.0.12.2       Serial0/0/0"
                }
            ]
        },
        quiz: [
          {
            id: "q1",
            question: "OSPF uses a wildcard mask in its 'network' statement instead of a subnet mask. What does a wildcard mask of 0.0.0.3 correspond to?",
            options: ["A /24 network", "A /30 network", "A /16 network", "A single host"],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "eigrp-configuration",
        title: "EIGRP Configuration",
        content: `
# EIGRP (Enhanced Interior Gateway Routing Protocol)

EIGRP is a Cisco-developed advanced distance-vector protocol that uses the DUAL algorithm for fast, loop-free convergence. It's simpler to configure than OSPF but is Cisco-proprietary.

## Key Commands
- \`router eigrp <as-number>\`
- \`network <network> <wildcard-mask>\`
- \`no auto-summary\` to keep classless (non-summarized) routing behavior

### Tactical Reference:
Reference configuration in \`infra/networking/routing/eigrp_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/routing/eigrp_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "What algorithm does EIGRP use to guarantee loop-free, fast convergence?",
            options: ["Dijkstra's SPF", "Bellman-Ford", "DUAL", "RIP hop-count"],
            correctAnswer: 2
          }
        ]
      },
      {
        id: "bgp-configuration",
        title: "BGP Configuration",
        content: `
# BGP (Border Gateway Protocol)

BGP is the routing protocol of the internet itself — it exchanges reachability information between different Autonomous Systems (organizations, ISPs) rather than within a single one.

## Key Commands
- \`router bgp <local-as-number>\`
- \`neighbor <ip> remote-as <their-as-number>\`
- \`network <network> mask <subnet-mask>\` to advertise a prefix

### Tactical Reference:
Reference configuration in \`infra/networking/routing/bgp_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/routing/bgp_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "BGP peering between two DIFFERENT autonomous systems is called:",
            options: ["iBGP", "eBGP", "OSPF virtual-linking", "Route redistribution"],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "dhcp-server-configuration",
        title: "DHCP Server Configuration",
        content: `
# DHCP Server Configuration

Instead of manually assigning every host's IP address, a router (or dedicated server) can automatically lease addresses, gateways, and DNS servers to clients on the LAN.

## Key Commands
- \`ip dhcp excluded-address\` to reserve static addresses (gateways, servers) out of the pool
- \`ip dhcp pool <name>\` then \`network\`, \`default-router\`, \`dns-server\`, \`lease\`

### Tactical Reference:
Reference configuration in \`infra/networking/services/dhcp_server_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/services/dhcp_server_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "Why do you configure 'ip dhcp excluded-address' before creating the pool?",
            options: [
              "To speed up lease negotiation",
              "To stop DHCP from handing out addresses already used by static devices like the gateway",
              "To enable DHCP relay",
              "It's required syntax with no functional effect"
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "dhcp-relay-configuration",
        title: "DHCP Relay Agent Configuration",
        content: `
# DHCP Relay Agent

DHCP requests are broadcasts, which routers don't forward by default. When the DHCP server lives on a different subnet than the clients, the client-facing router must relay those broadcasts as unicast to the real server.

## Key Command
\`ip helper-address <dhcp-server-ip>\` — configured on the client-facing interface of the router closest to the clients.

### Tactical Reference:
Reference configuration in \`infra/networking/services/dhcp_relay_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/services/dhcp_relay_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "What single command turns a router interface into a DHCP relay agent?",
            options: ["ip dhcp relay", "ip helper-address", "ip forward-protocol dhcp", "dhcp-relay enable"],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "nat-configuration",
        title: "NAT Configuration",
        content: `
# NAT (Network Address Translation)

NAT translates private internal IP addresses to public ones as traffic exits to the internet, conserving public IPv4 space and hiding internal addressing.

## Key Concepts
- Static NAT: one-to-one, permanent mapping — good for servers that need a consistent public IP
- Dynamic NAT: a shared pool of public IPs handed out to inside hosts as needed

### Tactical Reference:
Reference configuration in \`infra/networking/security/nat_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/security/nat_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "Which NAT type would you use to give a company's web server a permanent, unchanging public IP address?",
            options: ["Dynamic NAT", "Static NAT", "PAT", "NAT is not applicable to servers"],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "pat-configuration",
        title: "PAT Configuration",
        content: `
# PAT (Port Address Translation)

Also called "NAT Overload," PAT lets many internal hosts share a single public IP address simultaneously, distinguishing their sessions by source port number. This is what most home and small-office routers do.

## Key Command
\`ip nat inside source list <acl> interface <outside-interface> overload\`

### Tactical Reference:
Reference configuration in \`infra/networking/security/pat_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/security/pat_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "What keyword enables PAT (NAT Overload) in the 'ip nat inside source' command?",
            options: ["overload", "shared", "pat-mode", "multiplex"],
            correctAnswer: 0
          }
        ]
      },
      {
        id: "standard-acl-configuration",
        title: "Standard ACL Configuration",
        content: `
# Standard Access Control Lists

Standard ACLs filter traffic based on SOURCE IP address only — nothing else. Because they can't see destination or port, best practice is to place them as close to the DESTINATION network as possible to avoid over-blocking.

## Key Commands
\`access-list <1-99> {permit|deny} <source> <wildcard-mask>\`, applied with \`ip access-group <number> {in|out}\`

### Tactical Reference:
Reference configuration in \`infra/networking/security/acl_standard_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/security/acl_standard_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "Because standard ACLs only match on source address, where should they generally be placed?",
            options: ["Close to the source", "Close to the destination", "On every interface", "It never matters"],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "extended-acl-configuration",
        title: "Extended ACL Configuration",
        content: `
# Extended Access Control Lists

Extended ACLs can filter on source AND destination IP, protocol, and port number — giving far more granular control, like "allow this subnet to reach that server, but only on HTTP/HTTPS." Best practice is to place them close to the SOURCE, since they can already identify the traffic precisely.

## Key Commands
\`ip access-list extended <name>\` then \`permit/deny <protocol> <source> <destination> eq <port>\`

### Tactical Reference:
Reference configuration in \`infra/networking/security/acl_extended_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/security/acl_extended_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "What can an extended ACL filter on that a standard ACL cannot?",
            options: [
              "Only the source IP address",
              "Destination IP, protocol, and port number",
              "VLAN membership",
              "MAC addresses"
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "stp-configuration",
        title: "STP Configuration",
        content: `
# STP (Spanning Tree Protocol)

Redundant switch links prevent single points of failure, but they also create Layer 2 loops that can melt a network with broadcast storms. STP prevents this by electing a Root Bridge and selectively blocking redundant ports.

## Key Commands
- \`spanning-tree vlan <id> priority <value>\` — lower priority wins the Root Bridge election
- \`spanning-tree portfast\` + \`bpduguard\` on access ports facing end devices only

### Tactical Reference:
Reference configuration in \`infra/networking/switching/stp_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/switching/stp_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "In a Root Bridge election, which switch wins?",
            options: [
              "The one with the highest priority number",
              "The one with the lowest priority number",
              "The one added to the network first",
              "The one with the most connected ports"
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "etherchannel-configuration",
        title: "EtherChannel Configuration",
        content: `
# EtherChannel (Link Aggregation)

EtherChannel bundles multiple physical links between two switches into a single logical link, increasing bandwidth and providing redundancy without STP blocking any of the bundled ports.

## Key Commands
- \`channel-group <id> mode active\` (LACP) or \`mode desirable\` (PAgP) or \`mode on\` (static, no negotiation)
- Configure the resulting \`interface port-channel <id>\` like any trunk/access port

### Tactical Reference:
Reference configuration in \`infra/networking/switching/etherchannel_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/switching/etherchannel_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "What is the main benefit of EtherChannel over just having two separate redundant links?",
            options: [
              "It encrypts traffic between switches",
              "STP doesn't block any of the bundled links, and bandwidth is combined",
              "It eliminates the need for VLANs",
              "It converts the link to fiber automatically"
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "ntp-configuration",
        title: "NTP Configuration",
        content: `
# NTP (Network Time Protocol)

Accurate, synchronized clocks across all network devices are essential for correlating log timestamps during an incident. NTP lets one device act as a time source (master) that others sync from.

## Key Commands
- \`ntp master <stratum>\` on the time source
- \`ntp server <ip>\` on clients pointing at that source

### Tactical Reference:
Reference configuration in \`infra/networking/services/ntp_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/services/ntp_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "Why is synchronized time (NTP) especially important for security operations?",
            options: [
              "It speeds up routing convergence",
              "It's required for VLANs to function",
              "It lets you correlate log timestamps across devices during incident investigation",
              "It reduces bandwidth usage"
            ],
            correctAnswer: 2
          }
        ]
      },
      {
        id: "snmp-configuration",
        title: "SNMP Configuration",
        content: `
# SNMP (Simple Network Management Protocol)

SNMP lets a Network Management Station (NMS) poll devices for status information (interface stats, CPU, memory) and receive traps for important events, without an admin logging into each device individually.

## Key Commands
- \`snmp-server community <string> {RO|RW}\`
- \`snmp-server host <nms-ip> version 2c <community>\`

### Tactical Reference:
Reference configuration in \`infra/networking/services/snmp_full_lab.cfg\`.

> Note: SNMPv2c sends community strings in plaintext. SNMPv3 (with auth + encryption) is the production-safe choice.
        `,
        downloadUrl: "/configs/services/snmp_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "Why is SNMPv2c considered insecure compared to SNMPv3?",
            options: [
              "It doesn't support traps",
              "It sends community strings (like passwords) in plaintext",
              "It can only monitor routers, not switches",
              "It requires more bandwidth"
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "syslog-configuration",
        title: "Syslog Server Configuration",
        content: `
# Syslog Server Configuration

Rather than relying on limited on-device log buffers, devices can forward all their log messages to a centralized Syslog server — critical for retaining evidence and correlating events across a whole network during an investigation.

## Key Commands
- \`logging host <syslog-server-ip>\`
- \`logging trap informational\` to control the severity level forwarded

### Tactical Reference:
Reference configuration in \`infra/networking/services/syslog_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/services/syslog_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "What is the main advantage of centralized Syslog over relying only on each device's local log buffer?",
            options: [
              "It's faster to configure",
              "Logs survive a device reboot/wipe and can be correlated across the whole network",
              "It automatically blocks malicious traffic",
              "It replaces the need for NTP"
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "ssh-configuration",
        title: "SSH Remote Management Configuration",
        content: `
# SSH Remote Management

Telnet sends everything — including passwords — in plaintext. SSH encrypts remote management sessions, making it the standard for securely administering routers and switches over the network instead of via console cable.

## Key Commands
- \`crypto key generate rsa\` to generate the keys SSH needs
- \`line vty 0 4\` then \`transport input ssh\` + \`login local\` to restrict VTY lines to SSH only

### Tactical Reference:
Reference configuration in \`infra/networking/security/ssh_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/security/ssh_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "What must be generated on a router before SSH can be enabled?",
            options: ["A VLAN database", "An RSA key pair", "A DHCP pool", "A NAT pool"],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "vpn-configuration",
        title: "VPN Configuration",
        content: `
# Site-to-Site VPN (IPsec)

A site-to-site VPN builds an encrypted tunnel between two routers over an untrusted network (like the internet), letting two private LANs communicate securely as if directly connected.

## Key Concepts
- ISAKMP/IKE Phase 1 negotiates a secure management channel (encryption, hashing, PSK)
- IPsec transform-set + crypto map define what traffic gets encrypted (Phase 2) and how

### Tactical Reference:
Reference configuration in \`infra/networking/security/vpn_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/security/vpn_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "What is the purpose of the pre-shared key (PSK) in a site-to-site IPsec VPN?",
            options: [
              "It encrypts the actual user data",
              "It authenticates the two VPN peers to each other during IKE negotiation",
              "It assigns IP addresses to remote users",
              "It replaces the need for an ACL"
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: "port-security-configuration",
        title: "Port Security Configuration",
        content: `
# Port Security

Port Security restricts which MAC addresses may connect to a given switch port, protecting against unauthorized devices, rogue switches, and MAC flooding attacks.

## Key Commands
- \`switchport port-security\` to enable it
- \`switchport port-security maximum <n>\` and \`mac-address sticky\` to learn and lock the allowed MAC(s)
- \`switchport port-security violation {protect|restrict|shutdown}\` to define the response

### Tactical Reference:
Reference configuration in \`infra/networking/security/port_security_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/security/port_security_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "Which port security violation mode is the strictest, err-disabling the port entirely?",
            options: ["protect", "restrict", "shutdown", "sticky"],
            correctAnswer: 2
          }
        ]
      },
      {
        id: "hsrp-configuration",
        title: "HSRP Configuration",
        content: `
# HSRP (Hot Standby Router Protocol)

HSRP is a Cisco-proprietary first-hop redundancy protocol. Two or more routers share a single virtual IP and MAC address that hosts use as their default gateway — if the Active router fails, the Standby takes over transparently.

## Key Commands
- \`standby <group> ip <virtual-ip>\`
- \`standby <group> priority <value>\` + \`standby <group> preempt\`

### Tactical Reference:
Reference configuration in \`infra/networking/routing/hsrp_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/routing/hsrp_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "What IP address do end hosts use as their default gateway in an HSRP setup?",
            options: [
              "The Active router's real interface IP",
              "The Standby router's real interface IP",
              "The shared virtual IP address",
              "Each host uses a different gateway"
            ],
            correctAnswer: 2
          }
        ]
      },
      {
        id: "vrrp-configuration",
        title: "VRRP Configuration",
        content: `
# VRRP (Virtual Router Redundancy Protocol)

VRRP is the open, vendor-neutral equivalent of HSRP — it lets multiple routers from different vendors share a virtual gateway IP, with one Master handling traffic and one or more Backups ready to take over.

## Key Commands
- \`vrrp <group> ip <virtual-ip>\`
- \`vrrp <group> priority <value>\` + \`vrrp <group> preempt\`

### Tactical Reference:
Reference configuration in \`infra/networking/routing/vrrp_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/routing/vrrp_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "What is the key difference between VRRP and HSRP?",
            options: [
              "VRRP is an open standard usable across vendors; HSRP is Cisco-proprietary",
              "VRRP only works with wireless devices",
              "HSRP supports more than two routers, VRRP does not",
              "There is no functional difference"
            ],
            correctAnswer: 0
          }
        ]
      },
      {
        id: "qos-configuration",
        title: "QoS Configuration",
        content: `
# QoS (Quality of Service)

When bandwidth is limited, not all traffic is equally sensitive to delay. QoS classifies and prioritizes traffic — for example, giving latency-sensitive voice traffic priority over bulk file transfers — using Cisco's Modular QoS CLI (MQC).

## Key Commands
- \`class-map\` to define what traffic to match
- \`policy-map\` to define how to treat each class (\`priority\`, \`bandwidth\`, \`fair-queue\`)
- \`service-policy output <policy>\` to apply it to an interface

### Tactical Reference:
Reference configuration in \`infra/networking/services/qos_full_lab.cfg\`.
        `,
        downloadUrl: "/configs/services/qos_full_lab.cfg",
        quiz: [
          {
            id: "q1",
            question: "In Cisco's Modular QoS CLI, what does a 'class-map' do?",
            options: [
              "Applies a policy to an interface",
              "Defines criteria to identify/match a type of traffic",
              "Encrypts the matched traffic",
              "Sets the physical interface speed"
            ],
            correctAnswer: 1
          }
        ]
      }
    ]
  }
];

export function getCourse(id: string) {
  return COURSES.find(c => c.id === id);
}

export function getLesson(courseId: string, lessonId: string) {
  const course = getCourse(courseId);
  return course?.lessons.find(l => l.id === lessonId);
}
