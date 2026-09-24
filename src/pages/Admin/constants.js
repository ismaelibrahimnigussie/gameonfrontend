import { Building2, Coins, Home, Package, Settings, Shield, Users } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Home, mobileLabel: 'Home' },
  { id: 'zones', label: 'Game Zones', icon: Building2, mobileLabel: 'Zones' },
  { id: 'players', label: 'Players', icon: Users, mobileLabel: 'Players' },
  { id: 'admins', label: 'Administrators', icon: Shield, mobileLabel: 'Admins', superAdminOnly: true },
  { id: 'credits', label: 'Credits', icon: Coins, mobileLabel: 'Credits' },
  { id: 'packages', label: 'Packages', icon: Package, mobileLabel: 'Packages' },
  { id: 'costs', label: 'System Costs', icon: Settings, mobileLabel: 'Costs', superAdminOnly: true },
];

export const PAGE_SUBTITLES = {
  overview: 'Platform overview and quick actions',
  zones: 'Manage game zones and verification',
  credits: 'Track and manage credit transactions',
  packages: 'Configure credit packages',
};

export const initialZoneForm = { zone_name: '', address: '', owner_name: '', owner_phone: '' };
export const initialGrantForm = { zoneId: '', creditId: '', amount: '', transaction_type: 'Bonus' };
export const initialPackageForm = { credit_name: '', credit_amount: '', duration_days: '30', price: '0', offered_by: 'Registration' };
export const initialPlayerForm = { player_type: 'random', user_id: '', station_id: '', nickname: '' };
export const initialAdminForm = { admin_name: '', phone: '', password: '', role: 'Admin', status: 'Active' };

export const pickZoneId = (zone) => zone?.zone_id ?? zone?.id ?? zone?.zoneId ?? null;
export const pickPackageId = (pkg) => pkg?.credit_id ?? pkg?.id ?? pkg?.package_id ?? null;
