import type { Metadata } from 'next';
import WorkspaceClient from './WorkspaceClient';

export const metadata: Metadata = {
  title: 'Engineering Workspace – Saved Calculations and Design Projects',
  description:
    'Organise engineering calculations into projects, record assumptions, and export auditable calculation sheets.',
  robots: { index: true, follow: true },
};

export default function WorkspacePage() {
  return <WorkspaceClient />;
}
