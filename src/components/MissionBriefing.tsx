import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

interface MissionBriefingProps {
  phase: number;
  phaseName: string;
}

const briefingContent: Record<number, {
  title: string;
  subtitle: string;
  concepts: string[];
  awsSteps: { step: number; command?: string; description: string }[];
  tips: string[];
}> = {
  1: {
    title: 'AWS Global Infrastructure',
    subtitle: 'Understanding Regions, Availability Zones, and Latency',
    concepts: [
      'AWS operates 30+ geographic Regions worldwide',
      'Each Region has multiple isolated Availability Zones (AZs)',
      'Choosing the nearest Region reduces latency for users',
      'Latency is measured in milliseconds (ms) — lower is better',
      'us-east-1 (N. Virginia) is the oldest and biggest Region',
    ],
    awsSteps: [
      { step: 1, description: 'Navigate to AWS Management Console' },
      { step: 2, description: 'Check the Region selector (top-right corner)' },
      { step: 3, description: 'Choose region closest to your target audience' },
      { step: 4, description: 'For this mission: select the lowest-latency region' },
    ],
    tips: ['Pro Tip: Use cloudping.info to test latency to AWS regions from your browser.'],
  },
  2: {
    title: 'EC2 Instance Launch & Key Pairs',
    subtitle: 'Provisioning a Virtual Server with Secure SSH Access',
    concepts: [
      'EC2 = Elastic Compute Cloud (virtual servers in the cloud)',
      'AMI = Amazon Machine Image (OS template) — we use Ubuntu 24.04 LTS',
      't2.micro is Free Tier eligible (1 vCPU, 1 GB RAM)',
      '.pem key file = your ONLY way to access the server securely',
      'chmod 400 = Owner read-only — SSH rejects overly-permissive keys',
    ],
    awsSteps: [
      { step: 1, description: 'EC2 Dashboard → Launch Instance' },
      { step: 2, description: 'Name: "orbital-server-01"' },
      { step: 3, description: 'AMI: Ubuntu Server 24.04 LTS (HVM), SSD Volume Type' },
      { step: 4, description: 'Instance Type: t2.micro (Free Tier eligible)' },
      { step: 5, description: 'Create new Key Pair → "orbital-key" → Download .pem' },
      { step: 6, command: 'chmod 400 orbital-key.pem', description: 'Set correct file permissions' },
    ],
    tips: ['⚠️ Store your .pem file safely — AWS will NOT give you another copy!'],
  },
  3: {
    title: 'SSH — Secure Shell Protocol',
    subtitle: 'Establishing an Encrypted Remote Connection',
    concepts: [
      'SSH uses asymmetric cryptography (public + private key pair)',
      'AWS embeds your public key into the EC2 instance at launch',
      'Your private .pem key proves your identity without passwords',
      'ubuntu@<ip> — Ubuntu AMIs use "ubuntu" as default user',
      'Port 22 is the standard SSH port (opened by default)',
    ],
    awsSteps: [
      { step: 1, description: 'Get your instance\'s Public IPv4 from EC2 Console' },
      { step: 2, command: 'ssh -i orbital-key.pem ubuntu@13.233.4.100', description: 'Connect using your private key' },
      { step: 3, description: 'Type "yes" to accept the host fingerprint on first connection' },
      { step: 4, description: 'You are now logged into a remote Ubuntu server!' },
    ],
    tips: ['The -i flag specifies your identity file (private key). Always use the full path if not in current directory.'],
  },
  4: {
    title: 'Nginx Web Server & Security Groups',
    subtitle: 'Installing a Web Server and Configuring Firewall Rules',
    concepts: [
      'apt = Advanced Package Tool (Ubuntu\'s package manager)',
      'Nginx = High-performance HTTP server & reverse proxy',
      'Security Groups = Virtual firewall for EC2 instances',
      'Inbound rules control traffic entering the instance',
      'Port 80 = HTTP, Port 443 = HTTPS, Port 22 = SSH',
    ],
    awsSteps: [
      { step: 1, command: 'sudo apt update', description: 'Refresh package repository index' },
      { step: 2, command: 'sudo apt install nginx -y', description: 'Install Nginx web server' },
      { step: 3, description: 'Go to EC2 → Security Groups → Edit inbound rules' },
      { step: 4, description: 'Add Rule: Type=HTTP, Port=80, Source=0.0.0.0/0 (anywhere)' },
      { step: 5, description: 'Visit http://<public-ip> — you should see the Nginx welcome page!' },
    ],
    tips: ['sudo = Super User DO. Required for system-level package operations.'],
  },
  5: {
    title: 'S3 — Simple Storage Service',
    subtitle: 'Creating a Globally Unique Serverless Storage Bucket',
    concepts: [
      'S3 is object storage — not a traditional file system',
      'Bucket names MUST be globally unique across ALL AWS accounts',
      'Names must be DNS-compliant: lowercase, no spaces, 3-63 chars',
      'S3 is region-scoped but the namespace is global',
      'Common patterns: company-project-environment (e.g., acme-prod-assets)',
    ],
    awsSteps: [
      { step: 1, description: 'S3 Console → Create Bucket' },
      { step: 2, description: 'Choose a globally unique, lowercase, hyphenated name' },
      { step: 3, description: 'Select your preferred AWS Region' },
      { step: 4, description: 'Leave "Block all public access" ON for now (we\'ll change later)' },
      { step: 5, description: 'Click "Create bucket"' },
    ],
    tips: ['💡 Avoid common words like "test", "website", "data" — they\'re almost certainly taken.'],
  },
  6: {
    title: 'S3 Object Upload & Content Types',
    subtitle: 'Uploading Static Files and Setting Metadata',
    concepts: [
      'S3 uses a flat structure — "folders" are just key name prefixes',
      'Every object has a key (filename), value (data), and metadata',
      'Content-Type header tells browsers how to render the file',
      'Static websites need: index.html, CSS, JS, images',
      'S3 can host entire static websites without any servers',
    ],
    awsSteps: [
      { step: 1, description: 'Open your S3 bucket → Objects tab → Upload' },
      { step: 2, description: 'Drag-and-drop or select your build files' },
      { step: 3, description: 'Set Content-Type for each file (e.g., text/html for .html)' },
      { step: 4, description: 'Upload and verify files appear in the bucket' },
    ],
    tips: ['📦 Use AWS CLI for bulk uploads: aws s3 sync ./build s3://my-bucket'],
  },
  7: {
    title: 'S3 Public Access & Bucket Policies',
    subtitle: 'Making a Private Bucket Publicly Readable for Static Hosting',
    concepts: [
      'S3 is PRIVATE by default — this is a security feature',
      '"Block Public Access" prevents accidental data exposure',
      'Bucket Policy = JSON document defining access permissions',
      'IAM policies use Effect, Principal, Action, Resource structure',
      's3:GetObject allows reading objects (not listing buckets)',
    ],
    awsSteps: [
      { step: 1, description: 'S3 Bucket → Permissions → Block Public Access → Edit' },
      { step: 2, description: 'UNCHECK "Block all public access" → Confirm' },
      { step: 3, description: 'Bucket Policy → Edit → Paste the JSON policy' },
      { step: 4, command: '"Effect": "Allow", "Principal": "*", "Action": "s3:GetObject"', description: 'The three critical policy tokens' },
      { step: 5, description: 'Enable Static Website Hosting in Properties' },
      { step: 6, description: 'Access your site at the bucket website endpoint URL!' },
    ],
    tips: ['🔒 Never use "s3:*" — always follow the principle of least privilege.'],
  },
  8: {
    title: 'EC2 vs S3 — Choosing the Right Service',
    subtitle: 'IaaS Virtual Servers vs Serverless Object Storage',
    concepts: [
      'EC2 = IaaS — You manage the OS, updates, and scaling',
      'S3 = Serverless — AWS handles infrastructure automatically',
      'EC2 is for dynamic apps (Node.js, Python, databases)',
      'S3 is for static content (HTML, CSS, JS, images)',
      'Both can be used together for full-stack deployments',
    ],
    awsSteps: [
      { step: 1, description: 'Identify if your app needs server-side processing' },
      { step: 2, description: 'If YES (API, DB, auth) → EC2 or Lambda' },
      { step: 3, description: 'If NO (static React build) → S3 + CloudFront' },
      { step: 4, description: 'For hybrid: EC2 for API + S3 for frontend' },
    ],
    tips: ['🏆 Best practice: Use S3 for frontend + EC2/ECS for backend = scalable architecture.'],
  },
};

export default function MissionBriefing({ phase, phaseName }: MissionBriefingProps) {
  const { score, badges } = useGameStore();
  const briefing = briefingContent[phase] || briefingContent[1];

  return (
    <div className="h-full flex flex-col">
      {/* Briefing Header */}
      <div className="bg-cosmic-panel border-b border-cosmic-border px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-mono text-cosmic-accent tracking-wider glow-text">
            📋 MISSION BRIEFING
          </h2>
          <p className="text-xs text-cosmic-muted mt-0.5 font-mono">
            Phase {phase}: {phaseName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-cosmic-muted block">SCORE</span>
            <span className="text-sm font-mono text-cosmic-warning font-bold">{score}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-cosmic-muted block">BADGES</span>
            <span className="text-sm font-mono text-cosmic-success font-bold">{badges.length}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 terminal-scan">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={phase + '-title'}
        >
          <h3 className="text-lg font-bold text-white leading-tight">{briefing.title}</h3>
          <p className="text-sm text-cosmic-accent/70 mt-1">{briefing.subtitle}</p>
        </motion.div>

        {/* Key Concepts */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          key={phase + '-concepts'}
          className="bg-cosmic-panel/50 border border-cosmic-border rounded-lg p-4"
        >
          <h4 className="text-xs font-mono text-cosmic-accent mb-3">🔬 CORE CONCEPTS</h4>
          <ul className="space-y-2">
            {briefing.concepts.map((concept, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="text-xs text-cosmic-text flex items-start gap-2"
              >
                <span className="text-cosmic-accent mt-0.5">▸</span>
                {concept}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* AWS Steps */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          key={phase + '-steps'}
          className="bg-cosmic-panel/50 border border-cosmic-border rounded-lg p-4"
        >
          <h4 className="text-xs font-mono text-cosmic-warning mb-3">📝 REAL-WORLD AWS STEPS</h4>
          <div className="space-y-3">
            {briefing.awsSteps.map((awsStep, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-cosmic-glow/20 border border-cosmic-glow/30 flex items-center justify-center text-[10px] font-mono text-cosmic-glow flex-shrink-0 mt-0.5">
                  {awsStep.step}
                </span>
                <div className="flex-1 min-w-0">
                  {awsStep.command && (
                    <code className="block text-[11px] font-mono text-cosmic-success bg-cosmic-bg/60 px-2 py-1 rounded mb-1 break-all">
                      $ {awsStep.command}
                    </code>
                  )}
                  <p className="text-xs text-cosmic-text">{awsStep.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          key={phase + '-tips'}
          className="bg-cosmic-warning/5 border border-cosmic-warning/20 rounded-lg p-4"
        >
          <h4 className="text-xs font-mono text-cosmic-warning mb-2">💡 TIPS & WARNINGS</h4>
          {briefing.tips.map((tip, i) => (
            <p key={i} className="text-xs text-cosmic-text">{tip}</p>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
