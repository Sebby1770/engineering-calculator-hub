import { CategoryInfo } from '@/types';

export const categories: CategoryInfo[] = [
  {
    id: 'electrical',
    name: 'Electrical Engineering',
    description: 'Circuit analysis, resistors, power, and voltage calculations',
    icon: '⚡',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Scientific calculations, number systems, and logarithms',
    icon: '∑',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'physics',
    name: 'Physics',
    description: 'Energy, frequency, wavelength, and wave calculations',
    icon: '⚛',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'conversions',
    name: 'Conversions',
    description: 'Unit conversions between dB, voltage, frequency, and period',
    icon: '⇄',
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'signals',
    name: 'Signals & Systems',
    description: 'Signal processing, Fourier transforms, and filter design',
    icon: '〜',
    color: 'from-rose-500 to-pink-600',
  },
];
