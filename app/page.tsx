"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { createClient } from "@supabase/supabase-js";
import {
  Trophy,
  User,
  Ticket,
  Camera,
  RotateCcw,
  Clock3,
  Heart,
  Mic2,
  Martini,
  ChevronRight,
  Sparkles,
  Receipt,
  Trash2,
  Crown,
  PawPrint,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

/**
 * No-Tailwind deployment notes
 *
 * Recommended stack:
 * - Next.js
 * - Plain CSS in app/globals.css or a CSS module
 *
 * Install:
 * npm install framer-motion html2canvas @supabase/supabase-js lucide-react
 *
 * Required environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Supabase table:
 * create table public.wedding_bets (
 *   id uuid primary key default gen_random_uuid(),
 *   bettor_name text not null,
 *   bet_type text not null check (bet_type in ('single','multi')),
 *   selections jsonb not null,
 *   created_at timestamptz not null default now(),
 *   slip_code text not null unique
 * );
 *
 * alter table public.wedding_bets enable row level security;
 *
 * create policy "Public read wedding bets"
 * on public.wedding_bets for select to anon using (true);
 *
 * create policy "Public insert wedding bets"
 * on public.wedding_bets for insert to anon with check (true);
 */

type BetType = "single" | "multi";

type Selection = {
  marketId: string;
  marketTitle: string;
  option: string;
  odds: string;
};

type StoredBet = {
  id?: string;
  bettor_name: string;
  bet_type: BetType;
  selections: Selection[];
  created_at?: string;
  slip_code: string;
};

type MarketOption = {
  label: string;
  baseOdds: string;
  odds?: string;
  tickets?: number;
};

type IconComponent = React.ComponentType<{ className?: string }>;

type Market = {
  id: string;
  title: string;
  category: string;
  icon: IconComponent;
  options: MarketOption[];
};

type GroupedMarkets = Record<string, Market[]>;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

const supabaseUrl =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : undefined;

const supabasePublishableKey =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    : undefined;

const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey)
    : null;

const DRAFT_KEY = "groomsday_betting_draft_v7";
const NAME_KEY = "groomsday_last_bettor_name_v1";
const DRIFT_STRENGTH = 0.65;

const BASE_MARKETS: Market[] = [
  {
    id: "dress_colour",
    title: "Free Tile: Phoebe's dress colour",
    category: "Opening Lines",
    icon: Crown,
    options: [
      { label: "White", baseOdds: "$1.01" },
      { label: "Any Other Colour", baseOdds: "$101.00" },
    ],
  },
  {
    id: "surname_after",
    title: "Phoebe's last name after the ceremony",
    category: "Opening Lines",
    icon: Crown,
    options: [
      { label: "Phoebe Grech-Wren", baseOdds: "$1.70" },
      { label: "Phoebe Grech", baseOdds: "$2.60" },
      { label: "Phoebe Wren", baseOdds: "$4.20" },
      { label: "Phoebe Wrench", baseOdds: "$8.50" },
      { label: "Any other name", baseOdds: "$21.00" },
    ],
  },
  {
    id: "zeus_greet",
    title: "Who does Zeus greet first?",
    category: "Opening Lines",
    icon: PawPrint,
    options: [
      { label: "Ethan", baseOdds: "$1.65" },
      { label: "Phoebe", baseOdds: "$2.10" },
      { label: "Bridal Party Member", baseOdds: "$3.50" },
      { label: "Family Member", baseOdds: "$5.50" },
      { label: "Random Guest", baseOdds: "$9.00" },
    ],
  },
  {
    id: "speech_rhymes",
    title: "How many rhymes in the Best Man speech?",
    category: "Speeches",
    icon: Mic2,
    options: [
      { label: "1 rhyme exactly", baseOdds: "$1.20" },
      { label: "0 rhymes", baseOdds: "$1.80" },
      { label: "2+ rhymes", baseOdds: "$2.10" },
    ],
  },
  {
    id: "tears",
    title: "Most likely to cry during their speech",
    category: "Speeches",
    icon: Sparkles,
    options: [
      { label: "Sophie Wyatt-Smith (Maid of Honour)", baseOdds: "$1.70" },
      { label: "Wayne Grech (Father of the Bride)", baseOdds: "$2.10" },
      { label: "Phoebe Grech", baseOdds: "$2.80" },
      { label: "Ethan Wren", baseOdds: "$3.40" },
      { label: "Stephen McCann (Best Man)", baseOdds: "$4.40" },
      { label: "Steven Wren (Father of the Groom)", baseOdds: "$101.00" },
    ],
  },
  {
    id: "speech_length",
    title: "Best Man speech length",
    category: "Speeches",
    icon: Mic2,
    options: [
      { label: "3 to 5 mins", baseOdds: "$2.10" },
      { label: "Under 3 mins", baseOdds: "$2.80" },
      { label: "5 to 8 mins", baseOdds: "$3.50" },
      { label: "Over 8 mins", baseOdds: "$4.80" },
    ],
  },
  {
    id: "aisle_pose",
    title: "End of aisle pose",
    category: "Ceremony",
    icon: Trophy,
    options: [
      { label: "Classic kiss", baseOdds: "$2.05" },
      { label: "Arms up celebration", baseOdds: "$3.40" },
      { label: "Dip pose", baseOdds: "$4.00" },
      { label: "Point to the crowd", baseOdds: "$7.00" },
    ],
  },
  {
    id: "first_kiss",
    title: "First kiss length",
    category: "Ceremony",
    icon: Heart,
    options: [
      { label: "2 to 4 seconds", baseOdds: "$2.00" },
      { label: "Quick peck", baseOdds: "$2.40" },
      { label: "5 to 8 seconds", baseOdds: "$3.60" },
      { label: "Cinema moment 9s+", baseOdds: "$6.00" },
    ],
  },
  {
    id: "cake_flavour",
    title: "What flavour is the cake?",
    category: "Reception",
    icon: Trophy,
    options: [
      { label: "Red velvet", baseOdds: "$1.35" },
      { label: "Vanilla", baseOdds: "$3.20" },
      { label: "Chocolate", baseOdds: "$3.60" },
      { label: "Lemon", baseOdds: "$5.00" },
    ],
  },
  {
    id: "first_drink",
    title: "Groom's first drink after ceremony",
    category: "Reception",
    icon: Martini,
    options: [
      { label: "Beer", baseOdds: "$2.10" },
      { label: "Champagne", baseOdds: "$2.30" },
      { label: "Whisky", baseOdds: "$4.80" },
      { label: "Water like a pro", baseOdds: "$10.00" },
    ],
  },
  {
    id: "first_dancefloor_person",
    title: "Who hits the dancefloor first?",
    category: "Dancefloor",
    icon: Sparkles,
    options: [
      { label: "Bridal party member", baseOdds: "$1.95" },
      { label: "Bride", baseOdds: "$2.60" },
      { label: "Groom", baseOdds: "$3.10" },
      { label: "Random guest", baseOdds: "$3.80" },
      { label: "Parent", baseOdds: "$4.20" },
    ],
  },
  {
    id: "last_dancefloor_song",
    title: "Last song played on the dancefloor",
    category: "Dancefloor",
    icon: Clock3,
    options: [
      { label: "Mr Brightside - The Killers", baseOdds: "$1.10" },
      { label: "Love Story - Taylor Swift", baseOdds: "$1.20" },
      { label: "Other", baseOdds: "$1.50" },
      { label: "Closing Time - Semisonic", baseOdds: "$1.80" },
    ],
  },
  {
    id: "first_dancefloor_song",
    title: "First song played on the dancefloor",
    category: "Dancefloor",
    icon: Clock3,
    options: [
      { label: "Other", baseOdds: "$1.20" },
      { label: "I Wanna Dance with Somebody - Whitney Houston", baseOdds: "$3.20" },
      { label: "Mr Brightside - The Killers", baseOdds: "$3.80" },
      { label: "Love Story - Taylor Swift", baseOdds: "$4.20" },
      { label: "Yeah! - Usher", baseOdds: "$4.60" },
    ],
  },
];

const styles = `
  :root {
    --rose-50: #fff1f5;
    --rose-100: #ffe4ec;
    --rose-200: #fecdd8;
    --rose-300: #f9a8d4;
    --rose-700: #be185d;
    --rose-800: #9d174d;
    --rose-900: #831843;
    --sky-100: #e0f2fe;
    --sky-800: #075985;
    --emerald-50: #ecfdf5;
    --emerald-300: #6ee7b7;
    --emerald-600: #059669;
    --stone-50: #fafaf9;
    --stone-100: #f5f5f4;
    --stone-200: #e7e5e4;
    --stone-400: #a8a29e;
    --stone-500: #78716c;
    --stone-700: #44403c;
    --stone-900: #1c1917;
    --white: #ffffff;
    --shadow-lg: 0 14px 32px rgba(28, 25, 23, 0.08);
    --shadow-xl: 0 22px 48px rgba(28, 25, 23, 0.14);
    --radius-xl: 18px;
    --radius-2xl: 24px;
    --radius-3xl: 28px;
  }

  * { box-sizing: border-box; }

  .gb-app {
    min-height: 100vh;
    color: var(--stone-900);
    background: radial-gradient(circle at top, rgba(251, 207, 232, 0.65), transparent 30%), linear-gradient(180deg, #fff7f5 0%, #f8fafc 100%);
  }

  .gb-topbar {
    position: sticky;
    top: 0;
    z-index: 30;
    padding: 10px 16px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    font-size: 11px;
    font-weight: 900;
    color: var(--rose-900);
    background: var(--rose-100);
    border-bottom: 1px solid var(--rose-200);
    box-shadow: var(--shadow-lg);
  }

  .gb-page {
    max-width: 440px;
    margin: 0 auto;
    min-height: 100vh;
    padding: 16px 16px 140px;
  }

  .gb-stack-1 > * + * { margin-top: 8px; }
  .gb-stack-2 > * + * { margin-top: 12px; }
  .gb-stack-3 > * + * { margin-top: 16px; }
  .gb-stack-4 > * + * { margin-top: 20px; }

  .gb-card,
  .gb-hero,
  .gb-history-card,
  .gb-empty,
  .gb-slip-panel,
  .gb-latest,
  .gb-confirm {
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid var(--stone-200);
    border-radius: var(--radius-3xl);
    box-shadow: var(--shadow-xl);
    padding: 16px;
    backdrop-filter: blur(6px);
  }

  .gb-latest {
    background: var(--rose-50);
    border-color: var(--rose-200);
  }

  .gb-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .gb-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .gb-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .gb-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .gb-col { min-width: 0; }

  .gb-eyebrow,
  .gb-label,
  .gb-category,
  .gb-micro {
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-size: 11px;
  }

  .gb-eyebrow { color: var(--rose-700); font-weight: 700; }
  .gb-label,
  .gb-category,
  .gb-micro { color: var(--stone-500); }

  .gb-title {
    margin: 8px 0 0;
    font-size: 34px;
    line-height: 0.95;
    font-weight: 900;
  }

  .gb-subtitle,
  .gb-helper,
  .gb-muted,
  .gb-empty-body {
    color: var(--stone-500);
  }

  .gb-subtitle { margin: 8px 0 0; font-size: 14px; }
  .gb-helper { margin: 8px 0 0; font-size: 12px; }
  .gb-empty-body { margin: 8px 0 0; font-size: 14px; }

  .gb-iconbox,
  .gb-marketicon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-xl);
    background: var(--rose-50);
    color: var(--rose-700);
  }

  .gb-iconbox {
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
  }

  .gb-marketicon {
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
  }

  .gb-banner,
  .gb-softbox,
  .gb-statsbox,
  .gb-pill,
  .gb-badge,
  .gb-ticker,
  .gb-tabbar,
  .gb-option,
  .gb-leg,
  .gb-input,
  .gb-oddsbox,
  .gb-toast,
  .gb-success {
    border: 1px solid var(--stone-200);
    border-radius: var(--radius-2xl);
  }

  .gb-banner,
  .gb-softbox {
    background: var(--rose-50);
    border-color: var(--rose-200);
    color: var(--rose-900);
    padding: 12px;
  }

  .gb-banner {
    text-align: center;
    font-size: 14px;
    font-weight: 700;
  }

  .gb-statsbox {
    background: var(--stone-50);
    padding: 12px;
    text-align: center;
  }

  .gb-stat-number {
    margin-top: 4px;
    font-size: 24px;
    font-weight: 900;
  }

  .gb-ticker {
    overflow: hidden;
    background: rgba(255, 255, 255, 0.7);
    border-color: rgba(244, 114, 182, 0.28);
    box-shadow: var(--shadow-lg);
  }

  .gb-ticker-track {
    display: flex;
    gap: 24px;
    white-space: nowrap;
    padding: 12px 16px;
    font-size: 14px;
    color: var(--rose-900);
  }

  .gb-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
  }

  .gb-badge--rose { background: var(--rose-100); color: var(--rose-900); border-color: var(--rose-200); }
  .gb-badge--stone { background: var(--stone-100); color: var(--stone-500); }
  .gb-badge--white { background: var(--white); color: var(--rose-900); }
  .gb-badge--selected { background: var(--rose-50); color: var(--rose-900); border-color: var(--rose-200); }
  .gb-badge--movement-in { background: var(--rose-100); color: var(--rose-800); border-color: var(--rose-200); }
  .gb-badge--movement-out { background: var(--sky-100); color: var(--sky-800); border-color: #bae6fd; }
  .gb-badge--movement-flat { background: var(--stone-100); color: var(--stone-700); }

  .gb-tabbar {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    padding: 4px;
    background: rgba(255, 255, 255, 0.82);
  }

  .gb-tab {
    border: 0;
    border-radius: 16px;
    background: transparent;
    color: var(--stone-500);
    font-size: 14px;
    font-weight: 600;
    padding: 12px;
    cursor: pointer;
  }

  .gb-tab--active {
    background: var(--rose-100);
    color: var(--rose-900);
  }

  .gb-input {
    width: 100%;
    height: 48px;
    padding: 0 14px;
    background: var(--stone-50);
    color: var(--stone-900);
    border-color: var(--stone-200);
    font-size: 16px;
    outline: none;
  }

  .gb-input::placeholder { color: var(--stone-400); }
  .gb-input:focus { border-color: var(--rose-300); box-shadow: 0 0 0 3px rgba(244, 114, 182, 0.12); }

  .gb-option {
    width: 100%;
    border: 1px solid var(--stone-200);
    background: var(--white);
    padding: 14px;
    text-align: left;
    cursor: pointer;
    transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease, background 140ms ease;
  }

  .gb-option:active { transform: scale(0.99); }
  .gb-option:hover { box-shadow: var(--shadow-lg); }
  .gb-option--active {
    border-color: var(--rose-300);
    background: var(--rose-50);
  }

  .gb-option--flash {
    border-color: var(--emerald-300);
    background: var(--emerald-50);
  }

  .gb-option-copy {
    min-width: 0;
    padding-right: 8px;
  }

  .gb-option-title {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  }

  .gb-movement-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 6px;
    font-size: 11px;
    color: var(--stone-500);
  }

  .gb-oddsbox {
    flex: 0 0 auto;
    min-width: 92px;
    text-align: center;
    padding: 10px 12px;
    font-weight: 700;
  }

  .gb-oddsbox--in { background: var(--rose-100); border-color: var(--rose-200); color: var(--rose-900); }
  .gb-oddsbox--out { background: var(--sky-100); border-color: #bae6fd; color: var(--sky-800); }
  .gb-oddsbox--flat { background: var(--stone-100); border-color: var(--stone-200); color: var(--stone-900); }

  .gb-odds-main {
    font-size: 20px;
    font-weight: 900;
    line-height: 1;
  }

  .gb-odds-sub {
    margin-top: 4px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    opacity: 0.7;
  }

  .gb-selection-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .gb-section-gap { margin-top: 16px; }
  .gb-category-wrap { padding: 0 4px; }

  .gb-leg {
    background: var(--stone-50);
    padding: 12px;
  }

  .gb-fixedbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    padding: 0 16px 16px;
    pointer-events: none;
  }

  .gb-fixedbar-inner {
    max-width: 440px;
    margin: 0 auto;
    pointer-events: auto;
  }

  .gb-slip-panel {
    background: rgba(255, 255, 255, 0.95);
  }

  .gb-button-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .gb-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: var(--radius-2xl);
    border: 1px solid var(--stone-200);
    min-height: 48px;
    padding: 12px 14px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease;
  }

  .gb-button:hover { box-shadow: var(--shadow-lg); }
  .gb-button:active { transform: scale(0.99); }
  .gb-button:disabled { opacity: 0.5; cursor: default; box-shadow: none; }
  .gb-button--default { background: var(--rose-100); color: var(--rose-900); }
  .gb-button--outline { background: var(--white); color: var(--stone-900); }

  .gb-confirm {
    background: var(--white);
    max-width: 420px;
    margin: 0 auto;
  }

  .gb-confirm-banner {
    background: var(--rose-100);
    color: var(--rose-900);
    padding: 10px 12px;
    border-radius: var(--radius-2xl);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-size: 11px;
    font-weight: 900;
  }

  .gb-slip-code {
    background: var(--rose-100);
    color: var(--rose-900);
    border-radius: var(--radius-xl);
    padding: 10px 12px;
    font-size: 12px;
    font-weight: 700;
  }

  .gb-history-actions {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .gb-empty {
    text-align: center;
  }

  .gb-toast,
  .gb-success {
    position: fixed;
    z-index: 50;
    background: var(--white);
    border-color: var(--stone-200);
    box-shadow: var(--shadow-xl);
  }

  .gb-toast {
    left: 50%;
    bottom: 96px;
    transform: translateX(-50%);
    padding: 10px 14px;
    font-size: 14px;
  }

  .gb-success {
    top: 96px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 18px;
    color: var(--rose-900);
    font-size: 14px;
    font-weight: 700;
  }

  .gb-hidden-mobile-gap { margin-top: 16px; }

  @media (max-width: 420px) {
    .gb-page { padding-left: 12px; padding-right: 12px; }
    .gb-fixedbar { padding-left: 12px; padding-right: 12px; }
    .gb-title { font-size: 30px; }
    .gb-option {
      padding: 12px;
    }
    .gb-oddsbox {
      min-width: 82px;
      padding: 8px 10px;
    }
  }
`;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("gb-card", className)}>{children}</div>;
}

function CardHeader({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={className}>{children}</div>;
}

function CardTitle({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={className}>{children}</div>;
}

function CardContent({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={className}>{children}</div>;
}

function Badge({ className = "", children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={cx("gb-badge", className)}>{children}</span>;
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx("gb-input", className)} />;
}

function Button({ className = "", variant = "default", children, ...props }: ButtonProps) {
  return <button {...props} className={cx("gb-button", variant === "outline" ? "gb-button--outline" : "gb-button--default", className)}>{children}</button>;
}

function loadDraft(): { name: string; selections: Selection[] } {
  if (typeof window === "undefined") return { name: "", selections: [] };
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : { name: "", selections: [] };
  } catch {
    return { name: "", selections: [] };
  }
}

function saveDraft(draft: { name: string; selections: Selection[] }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function loadLastName() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NAME_KEY) || "";
}

function saveLastName(name: string) {
  if (typeof window === "undefined") return;
  const trimmed = name.trim();
  if (!trimmed) return;
  localStorage.setItem(NAME_KEY, trimmed);
}

function buildSlipCode() {
  return `WED-${Math.random().toString(36).slice(2, 5).toUpperCase()}${Date.now().toString().slice(-4)}`;
}

function formatTime(iso?: string) {
  if (!iso) return "Just now";
  return new Date(iso).toLocaleString([], {
    hour: "numeric",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  });
}

function parseOdds(odds: string) {
  return Number(String(odds).replace("$", ""));
}

function formatOdds(value: number) {
  return `$${Number(value).toFixed(2)}`;
}

function calcCombinedOdds(selections: Selection[]) {
  if (!selections?.length) return "$0.00";
  const decimal = selections.reduce((acc, item) => acc * parseOdds(item.odds), 1);
  return formatOdds(decimal);
}

function buildSelectionsText(selections: Selection[]) {
  if (!selections?.length) return "No bets yet";
  return selections.map((selection) => selection.option).join(" • ");
}

function getMarketCounts(bets: StoredBet[], marketId: string) {
  const counts: Record<string, number> = {};
  let total = 0;

  bets.forEach((bet) => {
    (bet.selections || []).forEach((selection) => {
      if (selection.marketId === marketId) {
        counts[selection.option] = (counts[selection.option] || 0) + 1;
        total += 1;
      }
    });
  });

  return { counts, total };
}

function getDriftedOdds(baseOdds: string, count: number, average: number) {
  const base = parseOdds(baseOdds);
  const factor = Math.exp(-DRIFT_STRENGTH * Math.log((count + 1) / (average + 1)));
  const adjusted = base * factor;
  return formatOdds(Math.min(151, Math.max(1.01, adjusted)));
}

function fileNameFromName(name: string) {
  return name.toLowerCase().trim().split(" ").filter(Boolean).join("-") || "wedding-bet";
}

function getMovement(baseOdds: string, currentOdds: string) {
  const base = parseOdds(baseOdds);
  const current = parseOdds(currentOdds);

  if (current < base) {
    return { direction: "in", label: "Backed in", Icon: ArrowDownRight as IconComponent };
  }

  if (current > base) {
    return { direction: "out", label: "Drifting", Icon: ArrowUpRight as IconComponent };
  }

  return { direction: "flat", label: "Stable", Icon: Minus as IconComponent };
}

function runSanityChecks() {
  console.assert(parseOdds("$2.10") === 2.1, "parseOdds should parse decimal odds");
  console.assert(formatOdds(3.456) === "$3.46", "formatOdds should round to 2 decimals");
  console.assert(calcCombinedOdds([{ marketId: "a", marketTitle: "A", option: "X", odds: "$2.00" }]) === "$2.00", "single combined odds should match single leg");
  console.assert(
    calcCombinedOdds([
      { marketId: "a", marketTitle: "A", option: "X", odds: "$2.00" },
      { marketId: "b", marketTitle: "B", option: "Y", odds: "$1.50" },
    ]) === "$3.00",
    "multi combined odds should multiply legs"
  );
}

if (typeof window !== "undefined") {
  runSanityChecks();
}

function MarqueeTicker({ bets }: { bets: StoredBet[] }) {
  const items = bets.length
    ? bets.map((bet) => `${bet.bettor_name} locked in ${bet.bet_type}: ${buildSelectionsText(bet.selections)}`)
    : ["No bets placed yet."];

  const doubled = [...items, ...items];

  return (
    <div className="gb-ticker">
      <motion.div
        className="gb-ticker-track"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 24 }}
      >
        {doubled.map((item, index) => (
          <div key={`${item}-${index}`} className="gb-row">
            <Badge className="gb-badge--rose">LIVE ACTION</Badge>
            <span>{item}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function SelectionCard({
  active,
  onClick,
  title,
  odds,
  baseOdds,
  tickets,
  flash,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  odds: string;
  baseOdds: string;
  tickets: number;
  flash: boolean;
}) {
  const movement = getMovement(baseOdds, odds);
  const MovementIcon = movement.Icon;

  return (
    <button
      onClick={onClick}
      className={cx("gb-option", active && "gb-option--active", flash && "gb-option--flash")}
    >
      <div className="gb-between">
        <div className="gb-option-copy">
          <div className="gb-option-title">{title}</div>
          <div className="gb-movement-row">
            <span>
              {tickets} ticket{tickets === 1 ? "" : "s"}
            </span>
            <Badge
              className={cx(
                movement.direction === "in" && "gb-badge--movement-in",
                movement.direction === "out" && "gb-badge--movement-out",
                movement.direction === "flat" && "gb-badge--movement-flat"
              )}
            >
              <MovementIcon className="lucide-small" />
              {movement.label}
            </Badge>
            {flash ? <span style={{ color: "var(--emerald-600)" }}>Added to slip</span> : null}
          </div>
        </div>
        <div
          className={cx(
            "gb-oddsbox",
            movement.direction === "in" && "gb-oddsbox--in",
            movement.direction === "out" && "gb-oddsbox--out",
            movement.direction === "flat" && "gb-oddsbox--flat"
          )}
        >
          <div className="gb-odds-main">{odds}</div>
          <div className="gb-odds-sub">Opened {baseOdds}</div>
        </div>
      </div>
    </button>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="gb-empty">
      <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
      <div className="gb-empty-body">{body}</div>
    </div>
  );
}

function LatestLockedCard({ bet }: { bet: StoredBet | null }) {
  if (!bet) return null;

  return (
    <div className="gb-latest">
      <div className="gb-between">
        <div className="gb-col">
          <div className="gb-eyebrow">Latest locked in</div>
          <div style={{ marginTop: 8, fontSize: 18, fontWeight: 900 }}>{bet.bettor_name}</div>
          <div style={{ marginTop: 8, fontSize: 14, color: "var(--rose-900)" }}>{buildSelectionsText(bet.selections)}</div>
        </div>
        <Badge className="gb-badge--white">{calcCombinedOdds(bet.selections || [])}</Badge>
      </div>
    </div>
  );
}

const SlipPreview = React.forwardRef<HTMLDivElement, { bet: StoredBet }>(({ bet }, ref) => {
  return (
    <div ref={ref} className="gb-confirm gb-stack-3">
      <div className="gb-confirm-banner">Same Ceremony Multi Available</div>

      <div className="gb-between">
        <div className="gb-col">
          <div className="gb-eyebrow">Bet confirmed</div>
          <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>Betting On The Wedding</div>
          <div className="gb-subtitle">No real money. Very real bragging rights.</div>
        </div>
        <div className="gb-slip-code">{bet.slip_code}</div>
      </div>

      <div className="gb-softbox gb-stack-2" style={{ background: "var(--stone-50)", borderColor: "var(--stone-200)", color: "var(--stone-900)" }}>
        <div className="gb-between">
          <div>
            <div className="gb-label">Bettor</div>
            <div style={{ marginTop: 4, fontSize: 18, fontWeight: 700 }}>{bet.bettor_name}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="gb-label">Type</div>
            <div style={{ marginTop: 4, fontSize: 18, fontWeight: 700, textTransform: "capitalize" }}>{bet.bet_type}</div>
          </div>
        </div>
        <div className="gb-between" style={{ fontSize: 14 }}>
          <span className="gb-muted">Submitted</span>
          <span>{formatTime(bet.created_at)}</span>
        </div>
        <div className="gb-between" style={{ fontSize: 14 }}>
          <span className="gb-muted">Combined odds</span>
          <span style={{ fontWeight: 700, color: "var(--rose-900)" }}>{calcCombinedOdds(bet.selections || [])}</span>
        </div>
      </div>

      <div className="gb-softbox">
        <div className="gb-label" style={{ color: "var(--rose-700)" }}>Selections</div>
        <div style={{ marginTop: 4, fontSize: 14 }}>{buildSelectionsText(bet.selections)}</div>
      </div>

      <div className="gb-stack-2">
        {(bet.selections || []).map((selection, index) => (
          <div key={`${selection.marketId}-${selection.option}-${index}`} className="gb-leg gb-stack-1">
            <div className="gb-label">Leg {index + 1}</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{selection.marketTitle}</div>
            <div className="gb-between">
              <div style={{ fontSize: 14, color: "var(--rose-900)" }}>{selection.option}</div>
              <Badge className="gb-badge--white">{selection.odds}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

SlipPreview.displayName = "SlipPreview";

export default function GroomsdayBettingApp() {
  const [bets, setBets] = useState<StoredBet[]>([]);
  const [name, setName] = useState("");
  const [selections, setSelections] = useState<Selection[]>([]);
  const [activeView, setActiveView] = useState<"build" | "confirmed" | "history">("build");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [latestBet, setLatestBet] = useState<StoredBet | null>(null);
  const [lookupName, setLookupName] = useState("");
  const [toast, setToast] = useState("");
  const [flashKey, setFlashKey] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const slipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const draft = loadDraft();
    setName(draft.name || loadLastName() || "");
    setSelections(draft.selections || []);
  }, []);

  useEffect(() => {
    saveDraft({ name, selections });
    saveLastName(name);
  }, [name, selections]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!flashKey) return;
    const timer = window.setTimeout(() => setFlashKey(""), 650);
    return () => window.clearTimeout(timer);
  }, [flashKey]);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = window.setTimeout(() => setShowSuccess(false), 1400);
    return () => window.clearTimeout(timer);
  }, [showSuccess]);

  useEffect(() => {
    void fetchBets();

    if (!supabase) return;
    const interval = window.setInterval(() => {
      void fetchBets(false);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const markets = useMemo<Market[]>(() => {
    return BASE_MARKETS.map((market) => {
      const { counts, total } = getMarketCounts(bets, market.id);
      const average = market.options.length ? total / market.options.length : 0;

      return {
        ...market,
        options: market.options.map((option) => ({
          ...option,
          tickets: counts[option.label] || 0,
          odds: total > 0 ? getDriftedOdds(option.baseOdds, counts[option.label] || 0, average) : option.baseOdds,
        })),
      };
    });
  }, [bets]);

  const groupedMarkets = useMemo<GroupedMarkets>(() => {
    return markets.reduce<GroupedMarkets>((acc, market) => {
      if (!acc[market.category]) acc[market.category] = [];
      acc[market.category].push(market);
      return acc;
    }, {});
  }, [markets]);

  useEffect(() => {
    if (!selections.length) return;

    setSelections((prev) =>
      prev.map((selection) => {
        const matchedMarket = markets.find((market) => market.id === selection.marketId);
        const matchedOption = matchedMarket?.options.find((option) => option.label === selection.option);

        if (!matchedMarket || !matchedOption?.odds) return selection;

        return {
          ...selection,
          marketTitle: matchedMarket.title,
          odds: matchedOption.odds,
        };
      })
    );
  }, [markets]);

  async function fetchBets(showLoading = true) {
    if (showLoading) setLoading(true);

    if (!supabase) {
      if (showLoading) setLoading(false);
      setToast("Add Supabase env vars to enable shared cross-device bets");
      return;
    }

    const { data, error } = await supabase.from("wedding_bets").select("*").order("created_at", { ascending: false }).limit(75);

    if (!error && data) {
      const typedData = data as StoredBet[];
      setBets(typedData);
      setLatestBet(typedData[0] || null);
    }

    if (showLoading) setLoading(false);
  }

  function isSelected(marketId: string, optionLabel: string) {
    return selections.some((item) => item.marketId === marketId && item.option === optionLabel);
  }

  function toggleSelection(market: Market, option: MarketOption) {
    const exists = selections.some((item) => item.marketId === market.id && item.option === option.label);

    if (exists) {
      setSelections((prev) => prev.filter((item) => !(item.marketId === market.id && item.option === option.label)));
      return;
    }

    setFlashKey(`${market.id}-${option.label}`);
    setSelections((prev) => [
      ...prev,
      {
        marketId: market.id,
        marketTitle: market.title,
        option: option.label,
        odds: option.odds || option.baseOdds,
      },
    ]);
  }

  function clearSlip() {
    setSelections([]);
    setToast("Slip cleared");
  }

  const betType: BetType = selections.length <= 1 ? "single" : "multi";
  const combinedOdds = calcCombinedOdds(selections);

  const myBets = useMemo(() => {
    if (!lookupName.trim()) return [];
    return bets.filter((bet) => bet.bettor_name.toLowerCase().trim() === lookupName.toLowerCase().trim());
  }, [lookupName, bets]);

  async function submitBet() {
    if (!name.trim()) {
      setToast("Enter your name first");
      return;
    }

    if (selections.length === 0) {
      setToast("Add at least one selection");
      return;
    }

    if (!supabase) {
      setToast("Shared cross-device saving needs Supabase connected");
      return;
    }

    setSubmitting(true);

    const payload: StoredBet = {
      bettor_name: name.trim(),
      bet_type: betType,
      selections,
      slip_code: buildSlipCode(),
    };

    const { data, error } = await supabase.from("wedding_bets").insert(payload).select().single();

    setSubmitting(false);

    if (error || !data) {
      setToast("Could not save bet");
      return;
    }

    const saved = data as StoredBet;
    setBets((prev) => [saved, ...prev]);
    setLatestBet(saved);
    setShowSuccess(true);
    setActiveView("confirmed");
    setToast("Bet locked in");
  }

  async function saveAsImage() {
    if (!slipRef.current || !latestBet) return;

    const canvas = await html2canvas(slipRef.current, {
      backgroundColor: "#fff7f5",
      scale: 2,
      useCORS: true,
    });

    const link = document.createElement("a");
    link.download = `${fileNameFromName(latestBet.bettor_name)}-wedding-bet.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setToast("Slip screenshot saved");
  }

  function startNextBettor() {
    setName("");
    setSelections([]);
    saveDraft({ name: "", selections: [] });
    setActiveView("build");
    setToast("Ready for the next bettor");
  }

  return (
    <div className="gb-app">
      <style>{styles}</style>

      <div className="gb-topbar">Wedding Specials</div>

      <div className="gb-page gb-stack-3">
        <div className="gb-hero gb-stack-2">
          <div className="gb-between">
            <div className="gb-col">
              <div className="gb-eyebrow">Groomsday</div>
              <div className="gb-title">Betting On The Wedding</div>
              <div className="gb-subtitle">Build your bet slip and lock it in.</div>
            </div>
            <div className="gb-iconbox">
              <Ticket className="lucide-icon" />
            </div>
          </div>

          <div className="gb-banner">Same Ceremony Multi Available</div>

          <div className="gb-grid-2">
            <div className="gb-statsbox">
              <div className="gb-label">Slips lodged</div>
              <div className="gb-stat-number">{bets.length}</div>
            </div>
            <div className="gb-statsbox">
              <div className="gb-label">Live markets</div>
              <div className="gb-stat-number">{BASE_MARKETS.length}</div>
            </div>
          </div>
        </div>

        <LatestLockedCard bet={latestBet} />

        <MarqueeTicker bets={bets.slice(0, 14)} />

        <div className="gb-tabbar">
          {[
            { key: "build", label: "Build" },
            { key: "confirmed", label: "Slip" },
            { key: "history", label: "History" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as "build" | "confirmed" | "history")}
              className={cx("gb-tab", activeView === tab.key && "gb-tab--active")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeView === "build" && (
            <motion.div key="build" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="gb-stack-3">
              <Card>
                <CardHeader>
                  <CardTitle className="gb-row" style={{ fontSize: 18, fontWeight: 700 }}>
                    <div className="gb-marketicon">
                      <User className="lucide-small" />
                    </div>
                    <span>Your name</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="gb-stack-1">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
                  <div className="gb-helper">Enter your name to place your bet.</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="gb-row" style={{ fontSize: 18, fontWeight: 700 }}>
                    <div className="gb-marketicon">
                      <Receipt className="lucide-small" />
                    </div>
                    <span>Current slip</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="gb-stack-2">
                  <div className="gb-row">
                    <Badge className={cx(activeView === "build" && betType === "single" ? "gb-badge--rose" : "gb-badge--stone")}>Single</Badge>
                    <Badge className={cx(activeView === "build" && betType === "multi" ? "gb-badge--rose" : "gb-badge--stone")}>Multi</Badge>
                  </div>

                  <div className="gb-softbox gb-stack-2" style={{ background: "var(--stone-50)", borderColor: "var(--stone-200)", color: "var(--stone-900)" }}>
                    <div className="gb-between">
                      <div>
                        <div className="gb-label">Bet type</div>
                        <div style={{ marginTop: 4, fontSize: 18, fontWeight: 700, textTransform: "capitalize" }}>{betType}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="gb-label">Combined odds</div>
                        <div style={{ marginTop: 4, fontSize: 18, fontWeight: 700, color: "var(--rose-900)" }}>{combinedOdds}</div>
                      </div>
                    </div>
                  </div>

                  <div className="gb-softbox gb-stack-1">
                    <div className="gb-label" style={{ color: "var(--rose-700)" }}>Your selections</div>
                    <div style={{ fontSize: 14 }}>{buildSelectionsText(selections)}</div>
                  </div>

                  <div className="gb-selection-scroll">
                    {selections.length ? (
                      selections.map((item) => (
                        <Badge key={`${item.marketId}-${item.option}`} className="gb-badge--selected">
                          {item.option} {item.odds}
                        </Badge>
                      ))
                    ) : (
                      <div className="gb-muted" style={{ fontSize: 14 }}>No selections yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {Object.entries(groupedMarkets).map(([category, categoryMarkets]) => (
                <div key={category} className="gb-stack-3">
                  <div className="gb-category-wrap">
                    <div className="gb-category">{category}</div>
                  </div>

                  {categoryMarkets.map((market, idx) => {
                    const Icon = market.icon;
                    const selectedCount = selections.filter((item) => item.marketId === market.id).length;
                    const marketTickets = market.options.reduce((sum, option) => sum + (option.tickets || 0), 0);

                    return (
                      <Card key={market.id}>
                        <CardHeader>
                          <CardTitle className="gb-between">
                            <div className="gb-row gb-col">
                              <div className="gb-marketicon">
                                <Icon className="lucide-small" />
                              </div>
                              <div className="gb-col">
                                <div className="gb-label">{category} market {idx + 1}</div>
                                <div style={{ marginTop: 4, fontSize: 16, fontWeight: 700 }}>{market.title}</div>
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              {selectedCount > 0 ? <Badge className="gb-badge--selected">{selectedCount} in slip</Badge> : null}
                              <div className="gb-micro" style={{ marginTop: 8 }}>{marketTickets} tickets taken</div>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="gb-stack-2">
                          {market.options.map((option) => (
                            <SelectionCard
                              key={option.label}
                              active={isSelected(market.id, option.label)}
                              flash={flashKey === `${market.id}-${option.label}`}
                              onClick={() => toggleSelection(market, option)}
                              title={option.label}
                              odds={option.odds || option.baseOdds}
                              baseOdds={option.baseOdds}
                              tickets={option.tickets || 0}
                            />
                          ))}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          )}

          {activeView === "confirmed" && (
            <motion.div key="confirmed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="gb-stack-3">
              {latestBet ? (
                <>
                  <SlipPreview ref={slipRef} bet={latestBet} />
                  <div className="gb-history-actions">
                    <Button onClick={saveAsImage}>
                      <Camera className="lucide-small" /> Save screenshot
                    </Button>
                    <Button
                      onClick={() => {
                        setLookupName(latestBet.bettor_name);
                        setActiveView("history");
                      }}
                      variant="outline"
                    >
                      View my submitted bets
                      <ChevronRight className="lucide-small" />
                    </Button>
                    <Button onClick={startNextBettor} variant="outline">
                      <RotateCcw className="lucide-small" /> Start next bettor
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyState title="No confirmed slip yet" body="Place a bet from the Build tab first." />
              )}
            </motion.div>
          )}

          {activeView === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="gb-stack-3">
              <Card>
                <CardHeader>
                  <CardTitle style={{ fontSize: 18, fontWeight: 700 }}>Find submitted bets</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input value={lookupName} onChange={(e) => setLookupName(e.target.value)} placeholder="Enter your name" />
                </CardContent>
              </Card>

              {loading ? (
                <EmptyState title="Loading bets" body="Pulling shared slips from the cloud." />
              ) : myBets.length ? (
                myBets.map((bet) => (
                  <div key={bet.id || bet.slip_code} className="gb-history-card gb-stack-2">
                    <div className="gb-between">
                      <div className="gb-col">
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{bet.slip_code}</div>
                        <div className="gb-micro" style={{ marginTop: 4 }}>
                          {bet.bet_type} • {formatTime(bet.created_at)}
                        </div>
                      </div>
                      <Badge className="gb-badge--selected">{calcCombinedOdds(bet.selections || [])}</Badge>
                    </div>

                    <div className="gb-softbox gb-stack-1">
                      <div className="gb-label" style={{ color: "var(--rose-700)" }}>Selections</div>
                      <div style={{ fontSize: 14 }}>{buildSelectionsText(bet.selections)}</div>
                    </div>

                    <div className="gb-stack-2">
                      {(bet.selections || []).map((item, index) => (
                        <div key={`${bet.slip_code}-${index}`} className="gb-leg gb-stack-1">
                          <div className="gb-label">Leg {index + 1}</div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{item.marketTitle}</div>
                          <div className="gb-between">
                            <div style={{ fontSize: 14, color: "var(--rose-900)" }}>{item.option}</div>
                            <div className="gb-muted" style={{ fontSize: 14 }}>{item.odds}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No bets found" body="Try the exact name used when the bet was placed." />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="gb-fixedbar">
        <div className="gb-fixedbar-inner">
          <div className="gb-slip-panel gb-stack-2">
            <div className="gb-between">
              <div>
                <div className="gb-label">Bet slip</div>
                <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700 }}>
                  {selections.length} leg{selections.length === 1 ? "" : "s"} • {betType}
                </div>
              </div>
              <Badge className="gb-badge--selected">{combinedOdds}</Badge>
            </div>
            <div className="gb-button-row">
              <Button onClick={clearSlip} variant="outline">
                <Trash2 className="lucide-small" /> Clear
              </Button>
              <Button onClick={submitBet} disabled={submitting}>
                {submitting ? "Saving..." : `Lock ${betType}`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            className="gb-success"
          >
            <CheckCircle2 className="lucide-small" />
            Bet locked in
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="gb-toast"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
