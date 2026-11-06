import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgentGauge — Deterministic <15ms Model & Effort Router for Coding Agents',
  description:
    'Open-source Agent Skill, MCP Server, IDE Status-Bar Extension, and Telemetry Visualizer that routes coding tasks to the optimal Agent Mode + Model Tier + Effort Level (Low/Med/High) and learns from real git diff survival.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090A0F] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}

