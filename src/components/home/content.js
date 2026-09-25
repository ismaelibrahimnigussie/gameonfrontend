import {
  Gamepad2,
  User,
  Zap,
  Layers,
  Shield,
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Arenas', href: '#arenas' },
  { label: 'Network', href: '#network' },
];

export const PORTALS = [
  {
    id: 'game-zone',
    title: 'Game Zone Console',
    badge: 'Venue Host',
    tagline: 'Connect your physical arena',
    description: 'Register terminals, automate credit flows, and host local bracket tournaments with real-time sync.',
    icon: Gamepad2,
    gradient: 'from-[#00F0FF] via-[#00A3FF] to-[#0072FF]',
    accentColor: '#00F0FF',
    cta: 'Launch Arena Hub',
    path: '/GameZoneAuth'
  },
  {
    id: 'player',
    title: 'Player Portal',
    badge: 'Gamer ID',
    tagline: 'Your universal arcade pass',
    description: 'Scan station QR codes, claim your lane, and manage your match history, credits, and active sessions.',
    icon: User,
    gradient: 'from-[#7B2CBF] via-[#B5179E] to-[#D300C5]',
    accentColor: '#D300C5',
    cta: 'Open Player Hub',
    path: '/auth/user'
  }
];

export const METRICS = [
  { icon: Zap, value: '0.2s', label: 'Sync Speed' },
  { icon: Layers, value: '100%', label: 'Uptime' },
  { icon: Shield, value: 'E2EE', label: 'Security' }
];
