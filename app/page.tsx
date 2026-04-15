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
  ChevronDown,
  ChevronUp,
  Sparkles,
  Receipt,
  Trash2,
  Crown,
  PawPrint,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Music4,
  Flame,
  Copy,
  Users,
} from "lucide-react";

/**
 * No-Tailwind deployment notes
 *
 * Install:
 * npm install framer-motion html2canvas @supabase/supabase-js lucide-react
 *
 * Required environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *
 * Supabase setup SQL:
 * create extension if not exists pgcrypto;
 *
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
  spotlight?: boolean;
  options: MarketOption[];
};

type GroupedMarkets = Record<string, Market[]>;

type BridalPartyMeta = {
  key: string;
  display: string;
  role: string;
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "soft";
};

const supabaseUrl = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined;
const supabasePublishableKey = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY : undefined;
const supabase = supabaseUrl && supabasePublishableKey ? createClient(supabaseUrl, supabasePublishableKey) : null;

const DRAFT_KEY = "groomsday_betting_draft_v9";
const NAME_KEY = "groomsday_last_bettor_name_v1";
const DRIFT_STRENGTH = 0.42;

const BRIDAL_PARTY: BridalPartyMeta[] = [
  { key: "phoebe", display: "Phoebe", role: "Bride" },
  { key: "sophie", display: "Sophie", role: "Maid of Honour" },
  { key: "emma", display: "Emma", role: "Mother of Bride" },
];

const BASE_MARKETS: Market[] = [
  {
    id: "dress_colour",
    title: "Free Tile: Phoebe's dress colour",
    category: "Opening Lines",
    icon: Crown,
    spotlight: true,
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
    spotlight: true,
    options: [
      { label: "Phoebe Grech-Wren", baseOdds: "$1.70" },
      { label: "Phoebe Grech", baseOdds: "$2.60" },
      { label: "Phoebe Wren", baseOdds: "$4.20" },
      { label: "Any other name", baseOdds: "$21.00" },
      { label: "Phoebe Wrench", baseOdds: "$41.00" },
    ],
  },
  {
    id: "zeus_greet",
    title: "Who does Zeus greet first?",
    category: "Opening Lines",
    icon: PawPrint,
    spotlight: true,
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
    title: "Cries during their speech",
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
    id: "bridesmaid_height",
    title: "Bridesmaid in heels to be taller than Joseph Bianco",
    category: "Ceremony",
    icon: Users,
    spotlight: true,
    options: [
      { label: "No Bridesmaid to be taller than Joseph", baseOdds: "$1.55" },
      { label: "Jesse", baseOdds: "$2.10" },
      { label: "Morgan", baseOdds: "$3.20" },
      { label: "Sophie", baseOdds: "$5.50" },
      { label: "Angie", baseOdds: "$8.50" },
      { label: "All Bridesmaids", baseOdds: "$21.00" },
    ],
  },
  {
    id: "cake_flavour",
    title: "What flavour is the cake?",
    category: "Reception",
    icon: Trophy,
    options: [
      { label: "Chocolate", baseOdds: "$1.60" },
      { label: "Red velvet", baseOdds: "$2.20" },
      { label: "Vanilla", baseOdds: "$3.60" },
      { label: "Lemon", baseOdds: "$5.40" },
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
    icon: Music4,
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

const CATEGORY_ICONS: Record<string, IconComponent> = {
  "Opening Lines": Crown,
  Speeches: Mic2,
  Ceremony: Heart,
  Reception: Martini,
  Dancefloor: Music4,
};

const UNIQUE_CATEGORIES = Array.from(new Set(BASE_MARKETS.map((market) => market.category)));

const styles = `
  :root {
    --rose-25: #fff8fb;
    --rose-50: #fff1f5;
    --rose-75: #ffecf2;
    --rose-100: #ffe4ec;
    --rose-150: #ffd7e4;
    --rose-200: #fecdd8;
    --rose-300: #f9a8d4;
    --rose-700: #be185d;
    --rose-800: #9d174d;
    --rose-900: #831843;
    --mauve-100: #f4ecf7;
    --mauve-300: #dbc7e9;
    --mauve-700: #7e4d9e;
    --sage-50: #f4f7f3;
    --sage-200: #d7e3d2;
    --sage-700: #4d6b55;
    --stone-25: #fdfcfb;
    --stone-50: #fafaf9;
    --stone-100: #f5f5f4;
    --stone-150: #efecea;
    --stone-200: #e7e5e4;
    --stone-300: #d6d3d1;
    --stone-400: #a8a29e;
    --stone-500: #78716c;
    --stone-700: #44403c;
    --stone-900: #1c1917;
    --white: #ffffff;
    --shadow-lg: 0 12px 28px rgba(28, 25, 23, 0.07);
    --shadow-xl: 0 18px 42px rgba(28, 25, 23, 0.11);
    --radius-xl: 16px;
    --radius-2xl: 22px;
    --radius-3xl: 26px;
  }

  * { box-sizing: border-box; }

  .gb-app {
    min-height: 100vh;
    color: var(--stone-900);
    background: radial-gradient(circle at top, rgba(251, 207, 232, 0.58), transparent 32%), linear-gradient(180deg, #fff9f8 0%, #faf7f6 100%);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .gb-app button,
  .gb-app input {
    font: inherit;
  }

  .gb-serif {
    font-family: Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif;
  }

  .lucide-small {
    width: 16px;
    height: 16px;
    flex: 0 0 16px;
  }

  .lucide-icon {
    width: 22px;
    height: 22px;
  }

  .gb-topbar {
    position: sticky;
    top: 0;
    z-index: 30;
    padding: 10px 16px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.34em;
    font-size: 10px;
    font-weight: 800;
    color: var(--rose-900);
    background: rgba(255, 234, 242, 0.9);
    border-bottom: 1px solid var(--rose-200);
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(10px);
  }

  .gb-page {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    padding: 14px 14px calc(126px + env(safe-area-inset-bottom, 0px));
  }

  .gb-stack-1 > * + * { margin-top: 6px; }
  .gb-stack-2 > * + * { margin-top: 10px; }
  .gb-stack-3 > * + * { margin-top: 14px; }
  .gb-stack-4 > * + * { margin-top: 18px; }

  .gb-card,
  .gb-hero,
  .gb-history-card,
  .gb-slip-panel,
  .gb-latest,
  .gb-confirm,
  .gb-empty,
  .gb-bridal-card,
  .gb-hot-card {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid var(--stone-200);
    border-radius: var(--radius-3xl);
    box-shadow: var(--shadow-xl);
    padding: 14px;
    backdrop-filter: blur(8px);
  }

  .gb-latest,
  .gb-bridal-card--active {
    background: linear-gradient(180deg, rgba(255, 241, 245, 0.96) 0%, rgba(255, 248, 251, 0.96) 100%);
    border-color: var(--rose-200);
  }

  .gb-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .gb-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
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
  .gb-micro,
  .gb-section-kicker {
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 10px;
  }

  .gb-eyebrow,
  .gb-section-kicker { color: var(--rose-700); font-weight: 700; }
  .gb-label,
  .gb-category,
  .gb-micro { color: var(--stone-500); }

  .gb-title {
    margin: 6px 0 0;
    font-size: 31px;
    line-height: 0.98;
    font-weight: 700;
    color: var(--stone-900);
  }

  .gb-subtitle,
  .gb-helper,
  .gb-muted,
  .gb-empty-body,
  .gb-soft-muted { color: var(--stone-500); }

  .gb-subtitle { margin: 6px 0 0; font-size: 13px; }
  .gb-helper { margin: 6px 0 0; font-size: 12px; }
  .gb-empty-body { margin: 6px 0 0; font-size: 14px; }

  .gb-iconbox,
  .gb-marketicon,
  .gb-bridal-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-xl);
    background: linear-gradient(180deg, var(--rose-50) 0%, var(--rose-75) 100%);
    color: var(--rose-700);
  }

  .gb-iconbox {
    width: 44px;
    height: 44px;
    flex: 0 0 44px;
  }

  .gb-marketicon {
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
  }

  .gb-bridal-avatar {
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    font-size: 16px;
    font-weight: 800;
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
  .gb-success,
  .gb-category-toggle,
  .gb-story,
  .gb-chip-button {
    border: 1px solid var(--stone-200);
    border-radius: var(--radius-2xl);
  }

  .gb-banner,
  .gb-softbox,
  .gb-story {
    background: linear-gradient(180deg, var(--rose-50) 0%, var(--rose-25) 100%);
    border-color: var(--rose-200);
    color: var(--rose-900);
    padding: 12px;
  }

  .gb-banner {
    text-align: center;
    font-size: 13px;
    font-weight: 700;
  }

  .gb-statsbox,
  .gb-hot-card {
    background: linear-gradient(180deg, var(--stone-50) 0%, var(--stone-25) 100%);
    padding: 10px;
    text-align: center;
  }

  .gb-stat-number {
    margin-top: 4px;
    font-size: 20px;
    font-weight: 800;
    color: var(--stone-900);
  }

  .gb-ticker {
    overflow: hidden;
    background: rgba(255, 255, 255, 0.7);
    border-color: rgba(190, 24, 93, 0.16);
    box-shadow: var(--shadow-lg);
  }

  .gb-ticker-track {
    display: flex;
    gap: 18px;
    white-space: nowrap;
    padding: 10px 14px;
    font-size: 13px;
    color: var(--rose-900);
  }

  .gb-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
  }

  .gb-badge--rose { background: var(--rose-100); color: var(--rose-900); border-color: var(--rose-200); }
  .gb-badge--stone { background: var(--stone-100); color: var(--stone-500); }
  .gb-badge--white { background: var(--white); color: var(--rose-900); }
  .gb-badge--selected { background: linear-gradient(180deg, var(--rose-50) 0%, var(--rose-25) 100%); color: var(--rose-900); border-color: var(--rose-200); }
  .gb-badge--movement-in { background: var(--rose-100); color: var(--rose-800); border-color: var(--rose-200); }
  .gb-badge--movement-out { background: var(--mauve-100); color: var(--mauve-700); border-color: var(--mauve-300); }
  .gb-badge--movement-flat { background: var(--stone-100); color: var(--stone-700); }
  .gb-badge--success { background: var(--sage-50); color: var(--sage-700); border-color: var(--sage-200); }
  .gb-badge--spotlight { background: var(--stone-900); color: var(--white); border-color: var(--stone-900); }

  .gb-tabbar {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
    padding: 4px;
    background: rgba(255, 255, 255, 0.82);
  }

  .gb-tab {
    border: 0;
    border-radius: 15px;
    background: transparent;
    color: var(--stone-500);
    font-size: 13px;
    font-weight: 600;
    padding: 10px 6px;
    cursor: pointer;
  }

  .gb-tab--active {
    background: var(--rose-100);
    color: var(--rose-900);
  }

  .gb-input {
    width: 100%;
    height: 46px;
    padding: 0 14px;
    background: var(--stone-50);
    color: var(--stone-900);
    border-color: var(--stone-200);
    font-size: 16px;
    outline: none;
  }

  .gb-input::placeholder { color: var(--stone-400); }
  .gb-input:focus { border-color: var(--rose-300); box-shadow: 0 0 0 3px rgba(244, 114, 182, 0.1); }

  .gb-story-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .gb-category-toggle {
    width: 100%;
    padding: 11px 12px;
    background: rgba(255, 255, 255, 0.74);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    cursor: pointer;
  }

  .gb-category-toggle-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    text-align: left;
  }

  .gb-category-toggle-copy {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .gb-category-toggle-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--stone-900);
  }

  .gb-option {
    width: 100%;
    border: 1px solid var(--stone-200);
    background: linear-gradient(180deg, var(--white) 0%, var(--stone-25) 100%);
    padding: 12px;
    text-align: left;
    cursor: pointer;
    transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease, background 140ms ease;
  }

  .gb-option:active { transform: scale(0.99); }
  .gb-option:hover { box-shadow: var(--shadow-lg); }

  .gb-option--active {
    border-color: var(--rose-300);
    background: linear-gradient(180deg, var(--rose-50) 0%, var(--rose-25) 100%);
    box-shadow: 0 0 0 1px rgba(190, 24, 93, 0.08), var(--shadow-lg);
  }

  .gb-option--flash {
    border-color: var(--sage-200);
    background: linear-gradient(180deg, var(--sage-50) 0%, var(--white) 100%);
  }

  .gb-option-copy {
    min-width: 0;
    padding-right: 6px;
  }

  .gb-option-title-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .gb-option-title {
    font-size: 13px;
    font-weight: 700;
    line-height: 1.32;
    color: var(--stone-900);
    flex: 1 1 auto;
  }

  .gb-checkmark {
    color: var(--rose-700);
    flex: 0 0 auto;
    margin-top: 1px;
  }

  .gb-movement-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
    font-size: 10px;
    color: var(--stone-500);
  }

  .gb-opened-subtle {
    font-size: 10px;
    color: var(--stone-400);
  }

  .gb-oddsbox {
    flex: 0 0 auto;
    min-width: 84px;
    text-align: center;
    padding: 8px 10px;
    font-weight: 700;
  }

  .gb-oddsbox--in { background: var(--rose-100); border-color: var(--rose-200); color: var(--rose-900); }
  .gb-oddsbox--out { background: var(--mauve-100); border-color: var(--mauve-300); color: var(--mauve-700); }
  .gb-oddsbox--flat { background: var(--stone-100); border-color: var(--stone-200); color: var(--stone-900); }

  .gb-odds-main {
    font-size: 18px;
    font-weight: 800;
    line-height: 1;
  }

  .gb-odds-sub {
    margin-top: 4px;
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--stone-400);
  }

  .gb-selection-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .gb-chip-button {
    background: linear-gradient(180deg, var(--rose-50) 0%, var(--rose-25) 100%);
    border-color: var(--rose-200);
    color: var(--rose-900);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    cursor: pointer;
    white-space: nowrap;
  }

  .gb-chip-button:hover { box-shadow: var(--shadow-lg); }

  .gb-leg {
    background: linear-gradient(180deg, var(--stone-50) 0%, var(--stone-25) 100%);
    padding: 10px 12px;
  }

  .gb-fixedbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    padding: 0 14px calc(10px + env(safe-area-inset-bottom, 0px));
    pointer-events: none;
  }

  .gb-fixedbar-inner {
    max-width: 430px;
    margin: 0 auto;
    pointer-events: auto;
  }

  .gb-slip-panel {
    background: rgba(255, 255, 255, 0.96);
    padding: 12px;
    transition: box-shadow 160ms ease, transform 160ms ease;
  }

  .gb-slip-panel--pulse {
    box-shadow: 0 0 0 1px rgba(190, 24, 93, 0.12), var(--shadow-xl);
    transform: translateY(-2px);
  }

  .gb-button-row,
  .gb-action-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .gb-bridal-buttons {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .gb-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: var(--radius-2xl);
    border: 1px solid var(--stone-200);
    min-height: 44px;
    padding: 10px 14px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease;
  }

  .gb-button:hover { box-shadow: var(--shadow-lg); }
  .gb-button:active { transform: scale(0.99); }
  .gb-button:disabled { opacity: 0.5; cursor: default; box-shadow: none; }
  .gb-button--default { background: linear-gradient(180deg, var(--rose-100) 0%, var(--rose-150) 100%); color: var(--rose-900); }
  .gb-button--outline { background: var(--white); color: var(--stone-900); }
  .gb-button--soft { background: linear-gradient(180deg, var(--stone-50) 0%, var(--stone-25) 100%); color: var(--stone-900); }

  .gb-confirm {
    background: var(--white);
    max-width: 420px;
    margin: 0 auto;
  }

  .gb-confirm-banner {
    background: linear-gradient(180deg, var(--rose-100) 0%, var(--rose-75) 100%);
    color: var(--rose-900);
    padding: 10px 12px;
    border-radius: var(--radius-2xl);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 10px;
    font-weight: 800;
  }

  .gb-slip-code {
    background: linear-gradient(180deg, var(--rose-100) 0%, var(--rose-75) 100%);
    color: var(--rose-900);
    border-radius: var(--radius-xl);
    padding: 9px 11px;
    font-size: 11px;
    font-weight: 700;
  }

  .gb-history-actions,
  .gb-bridal-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
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
    bottom: calc(88px + env(safe-area-inset-bottom, 0px));
    transform: translateX(-50%);
    padding: 10px 14px;
    font-size: 13px;
  }

  .gb-success {
    top: 92px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    color: var(--rose-900);
    font-size: 13px;
    font-weight: 700;
  }

  .gb-market-meta {
    margin-top: 4px;
    font-size: 11px;
    color: var(--stone-500);
  }

  .gb-bridal-card {
    position: relative;
    overflow: hidden;
  }

  .gb-bridal-card::after {
    content: "";
    position: absolute;
    inset: auto -18% -44px auto;
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba(249, 168, 212, 0.2), transparent 68%);
    pointer-events: none;
  }

  .gb-bridal-status {
    font-size: 13px;
    font-weight: 700;
    color: var(--stone-900);
  }

  .gb-hot-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .gb-hot-card {
    text-align: left;
  }

  @media (max-width: 420px) {
    .gb-page {
      padding-left: 12px;
      padding-right: 12px;
      padding-bottom: calc(124px + env(safe-area-inset-bottom, 0px));
    }

    .gb-fixedbar {
      padding-left: 12px;
      padding-right: 12px;
    }

    .gb-title {
      font-size: 28px;
    }

    .gb-option {
      padding: 11px;
    }

    .gb-oddsbox {
      min-width: 76px;
      padding: 7px 9px;
    }

    .gb-odds-main {
      font-size: 17px;
    }

    .gb-hot-grid,
    .gb-grid-2,
    .gb-button-row,
    .gb-action-row,
    .gb-bridal-buttons {
      grid-template-columns: 1fr;
    }

    .gb-tabbar {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .gb-tab {
      font-size: 12px;
      padding: 9px 4px;
    }
  }
`;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatTicketCount(count: number) {
  return `${count} ${count === 1 ? "ticket" : "tickets"} taken`;
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
  return <button {...props} className={cx("gb-button", variant === "outline" ? "gb-button--outline" : variant === "soft" ? "gb-button--soft" : "gb-button--default", className)}>{children}</button>;
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
  if (!selections?.length) return "Build your slip to get started";
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

function getBridalPartyMeta(name: string): BridalPartyMeta | null {
  const normalized = name.toLowerCase().trim();
  return BRIDAL_PARTY.find((person) => normalized.includes(person.key)) || null;
}

function normalizeSlipSignature(selections: Selection[]) {
  return selections.map((selection) => `${selection.marketId}:${selection.option}`).sort().join("|");
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

function MarqueeTicker({ items }: { items: string[] }) {
  const doubled = [...items, ...items];

  return (
    <div className="gb-ticker">
      <motion.div
        className="gb-ticker-track"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 28 }}
      >
        {doubled.map((item, index) => (
          <div key={`${item}-${index}`} className="gb-row">
            <Badge className="gb-badge--rose">Live</Badge>
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
    <button onClick={onClick} className={cx("gb-option", active && "gb-option--active", flash && "gb-option--flash")}>
      <div className="gb-between">
        <div className="gb-option-copy">
          <div className="gb-option-title-row">
            <div className="gb-option-title">{title}</div>
            {active ? <CheckCircle2 className="lucide-small gb-checkmark" /> : null}
          </div>
          <div className="gb-movement-row">
            <span>{tickets === 1 ? "1 ticket" : `${tickets} tickets`}</span>
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
            <span className="gb-opened-subtle">Opened {baseOdds}</span>
            {flash ? <Badge className="gb-badge--success">Added</Badge> : null}
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
          <div className="gb-odds-sub">Now paying</div>
        </div>
      </div>
    </button>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="gb-empty gb-stack-1">
      <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
      <div className="gb-empty-body">{body}</div>
    </div>
  );
}

function LatestLockedCard({ bet }: { bet: StoredBet | null }) {
  if (!bet) {
    return (
      <div className="gb-latest gb-stack-1">
        <div className="gb-eyebrow">Latest locked in</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>No bets locked in yet</div>
        <div className="gb-empty-body">The first slip will appear here.</div>
      </div>
    );
  }

  return (
    <div className="gb-latest">
      <div className="gb-between">
        <div className="gb-col">
          <div className="gb-eyebrow">Latest locked in</div>
          <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800 }}>{bet.bettor_name}</div>
          <div style={{ marginTop: 6, fontSize: 14, color: "var(--rose-900)" }}>{buildSelectionsText(bet.selections)}</div>
        </div>
        <Badge className="gb-badge--white">{calcCombinedOdds(bet.selections || [])}</Badge>
      </div>
    </div>
  );
}

function BridalPartyCard({
  person,
  bet,
  onTail,
}: {
  person: BridalPartyMeta;
  bet: StoredBet | null;
  onTail: (bet: StoredBet) => void;
}) {
  return (
    <div className={cx("gb-bridal-card gb-stack-2", bet && "gb-bridal-card--active")}>
      <div className="gb-between">
        <div className="gb-row gb-col">
          <div className="gb-bridal-avatar">{person.display.charAt(0)}</div>
          <div className="gb-col">
            <div style={{ fontSize: 15, fontWeight: 800 }}>{person.display}</div>
            <div className="gb-micro" style={{ marginTop: 4 }}>{person.role}</div>
          </div>
        </div>
        <Badge className={bet ? "gb-badge--rose" : "gb-badge--stone"}>{bet ? "Slip lodged" : "Awaiting slip"}</Badge>
      </div>

      {bet ? (
        <>
          <div className="gb-bridal-status">{buildSelectionsText(bet.selections)}</div>
          <div className="gb-between">
            <div className="gb-helper">Combined odds</div>
            <Badge className="gb-badge--white">{calcCombinedOdds(bet.selections || [])}</Badge>
          </div>
          <div className="gb-bridal-buttons">
            <Button variant="soft" onClick={() => onTail(bet)}>
              <Copy className="lucide-small" /> Tail these picks
            </Button>
          </div>
        </>
      ) : (
        <div className="gb-helper">Awaiting their picks. Once they lock in, you can tail the slip here.</div>
      )}
    </div>
  );
}

const SlipPreview = React.forwardRef<HTMLDivElement, { bet: StoredBet }>(({ bet }, ref) => {
  return (
    <div ref={ref} className="gb-confirm gb-stack-3">
      <div className="gb-confirm-banner">Same Ceremony Multi Available</div>

      <div className="gb-between">
        <div className="gb-col">
          <div className="gb-eyebrow">Slip lodged</div>
          <div className="gb-title gb-serif" style={{ fontSize: 28, marginTop: 8 }}>Betting On The Wedding</div>
          <div className="gb-subtitle">For fun only. No real money will be paid out. Very real bragging rights.</div>
        </div>
        <div className="gb-slip-code">{bet.slip_code}</div>
      </div>

      <div className="gb-softbox gb-stack-2" style={{ background: "var(--stone-50)", borderColor: "var(--stone-200)", color: "var(--stone-900)" }}>
        <div className="gb-between">
          <div>
            <div className="gb-label">Bettor</div>
            <div style={{ marginTop: 4, fontSize: 17, fontWeight: 700 }}>{bet.bettor_name}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="gb-label">Type</div>
            <div style={{ marginTop: 4, fontSize: 17, fontWeight: 700, textTransform: "capitalize" }}>{bet.bet_type}</div>
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
  const [activeView, setActiveView] = useState<"build" | "confirmed" | "history" | "bridal">("build");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [latestBet, setLatestBet] = useState<StoredBet | null>(null);
  const [lookupName, setLookupName] = useState("");
  const [toast, setToast] = useState("");
  const [flashKey, setFlashKey] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [pulseSlip, setPulseSlip] = useState(false);
  const [bridalHomeOpen, setBridalHomeOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(UNIQUE_CATEGORIES.map((category) => [category, true]))
  );
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
    if (!pulseSlip) return;
    const timer = window.setTimeout(() => setPulseSlip(false), 650);
    return () => window.clearTimeout(timer);
  }, [pulseSlip]);

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

      const options = market.options
        .map((option) => ({
          ...option,
          tickets: counts[option.label] || 0,
          odds: total > 0 ? getDriftedOdds(option.baseOdds, counts[option.label] || 0, average) : option.baseOdds,
        }))
        .sort((a, b) => parseOdds(a.odds || a.baseOdds) - parseOdds(b.odds || b.baseOdds));

      return {
        ...market,
        options,
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

  const bridalPartyEntries = useMemo(() => {
    return BRIDAL_PARTY.map((person) => {
      const bet = bets.find((entry) => entry.bettor_name.toLowerCase().includes(person.key)) || null;
      return {
        ...person,
        bet,
      };
    });
  }, [bets]);

  const bridalPartyCount = useMemo(() => bridalPartyEntries.filter((entry) => !!entry.bet).length, [bridalPartyEntries]);

  const myBets = useMemo(() => {
    const normalized = lookupName.toLowerCase().trim();
    if (!normalized) return [];
    return bets.filter((bet) => bet.bettor_name.toLowerCase().trim().includes(normalized));
  }, [lookupName, bets]);

  const popularCombo = useMemo(() => {
    const combos = new Map<string, { label: string; count: number }>();

    bets.filter((bet) => bet.bet_type === "multi").forEach((bet) => {
      const signature = normalizeSlipSignature(bet.selections || []);
      const label = buildSelectionsText((bet.selections || []).slice(0, 3));
      const existing = combos.get(signature);
      combos.set(signature, {
        label,
        count: (existing?.count || 0) + 1,
      });
    });

    return Array.from(combos.values()).sort((a, b) => b.count - a.count)[0] || null;
  }, [bets]);

  const hotInsights = useMemo(() => {
    const marketStats = markets.map((market) => {
      const topOption = market.options.reduce<MarketOption | null>((best, option) => {
        if (!best) return option;
        return (option.tickets || 0) > (best.tickets || 0) ? option : best;
      }, null);

      return {
        market,
        totalTickets: market.options.reduce((sum, option) => sum + (option.tickets || 0), 0),
        topOption,
      };
    });

    const hottestMarket = marketStats.sort((a, b) => b.totalTickets - a.totalTickets)[0] || null;

    const allOptions = markets.flatMap((market) =>
      market.options.map((option) => ({
        marketTitle: market.title,
        label: option.label,
        odds: option.odds || option.baseOdds,
        tickets: option.tickets || 0,
      }))
    );

    const quietOutsider = allOptions
      .filter((option) => option.tickets === 0)
      .sort((a, b) => parseOdds(b.odds) - parseOdds(a.odds))[0] || allOptions.sort((a, b) => parseOdds(b.odds) - parseOdds(a.odds))[0] || null;

    return {
      hottestMarket,
      quietOutsider,
    };
  }, [markets]);

  const tickerItems = useMemo(() => {
    const items: string[] = [];

    if (latestBet) {
      items.push(`${latestBet.bettor_name} locked in ${latestBet.bet_type}: ${buildSelectionsText(latestBet.selections)}`);
    } else {
      items.push("Markets are open. Build your slip and lock it in.");
    }

    bridalPartyEntries.forEach((entry) => {
      if (entry.bet) {
        items.push(`${entry.display} has lodged a slip at ${calcCombinedOdds(entry.bet.selections)}`);
      } else {
        items.push(`${entry.display} is yet to reveal their picks`);
      }
    });

    if (hotInsights.hottestMarket?.topOption && hotInsights.hottestMarket.totalTickets > 0) {
      items.push(`Hot right now: ${hotInsights.hottestMarket.topOption.label} is leading ${hotInsights.hottestMarket.market.title}`);
    }

    if (popularCombo && popularCombo.count > 1) {
      items.push(`Popular multi: ${popularCombo.label} has been backed ${popularCombo.count} times`);
    }

    return items.slice(0, 8);
  }, [latestBet, bridalPartyEntries, hotInsights, popularCombo]);

  async function fetchBets(showLoading = true) {
    if (showLoading) setLoading(true);

    if (!supabase) {
      if (showLoading) setLoading(false);
      setToast("Supabase is not connected yet");
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
    setPulseSlip(true);
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

  function removeSelection(selection: Selection) {
    setSelections((prev) => prev.filter((item) => !(item.marketId === selection.marketId && item.option === selection.option)));
    setToast("Selection removed");
  }

  function clearSlip() {
    setSelections([]);
    setToast("Slip cleared");
  }

  function toggleCategory(category: string) {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }

  function expandAllCategories() {
    setCollapsedCategories(Object.fromEntries(UNIQUE_CATEGORIES.map((category) => [category, false])));
  }

  function collapseAllCategories() {
    setCollapsedCategories(Object.fromEntries(UNIQUE_CATEGORIES.map((category) => [category, true])));
  }

  function loadSlipFromBet(bet: StoredBet, sourceName: string) {
    setSelections(bet.selections || []);
    setActiveView("build");
    setPulseSlip(true);
    setToast(`${sourceName}'s slip loaded`);
  }

  const betType: BetType = selections.length <= 1 ? "single" : "multi";
  const combinedOdds = calcCombinedOdds(selections);

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
      setToast("Supabase is not connected yet");
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

      <div className="gb-topbar gb-serif">Wedding Specials</div>

      <div className="gb-page gb-stack-3">
        <div className="gb-hero gb-stack-2">
          <div className="gb-between">
            <div className="gb-col">
              <div className="gb-section-kicker">Groomsday</div>
              <div className="gb-title gb-serif">Betting On The Wedding</div>
              <div className="gb-subtitle">Outpick the bridal party, build your single or multi, and chase bragging rights.</div>
            </div>
            <div className="gb-iconbox">
              <Ticket className="lucide-icon" />
            </div>
          </div>

          <div className="gb-grid-2">
            <div className="gb-banner gb-stack-1">
              <div>Markets open • Bets close before the ceremony</div>
              <div className="gb-helper" style={{ margin: 0, color: "var(--rose-800)" }}>
                For fun only. No real money will be paid out.
              </div>
            </div>
            <div className="gb-story gb-stack-1">
              <div className="gb-label" style={{ color: "var(--rose-700)" }}>Game status</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Beat the bridal party</div>
              <div className="gb-helper" style={{ margin: 0 }}>Copy a bridal party slip or back your own read.</div>
            </div>
          </div>

          <div className="gb-grid-2">
            <div className="gb-statsbox">
              <div className="gb-label">Slips lodged</div>
              <div className="gb-stat-number">{bets.length}</div>
            </div>
            <div className="gb-statsbox">
              <div className="gb-label">Bridal party in</div>
              <div className="gb-stat-number">{bridalPartyCount}/3</div>
            </div>
          </div>
        </div>

        <div className="gb-stack-2">
          <button className="gb-category-toggle" onClick={() => setBridalHomeOpen((prev) => !prev)}>
            <div className="gb-category-toggle-left">
              <div className="gb-marketicon">
                <Users className="lucide-small" />
              </div>
              <div className="gb-category-toggle-copy">
                <div className="gb-section-kicker">Bridal Party Picks</div>
                <div className="gb-category-toggle-title">Watch the inner circle</div>
                <div className="gb-market-meta">{bridalPartyCount}/3 slips lodged • tap to {bridalHomeOpen ? "hide" : "view"}</div>
              </div>
            </div>
            <div className="gb-row">
              <Badge className={bridalPartyCount ? "gb-badge--rose" : "gb-badge--stone"}>{bridalPartyCount}/3 in</Badge>
              {bridalHomeOpen ? <ChevronUp className="lucide-small" /> : <ChevronDown className="lucide-small" />}
            </div>
          </button>

          {bridalHomeOpen ? (
            <>
              <div className="gb-bridal-grid">
                {bridalPartyEntries.map((entry) => (
                  <BridalPartyCard key={entry.key} person={entry} bet={entry.bet} onTail={(bet) => loadSlipFromBet(bet, entry.display)} />
                ))}
              </div>
              <Button variant="soft" onClick={() => setActiveView("bridal")}>Open Bridal Party tab</Button>
            </>
          ) : null}
        </div>

        <div className="gb-stack-2">
          <div className="gb-between">
            <div>
              <div className="gb-section-kicker">Hot Right Now</div>
              <div style={{ marginTop: 4, fontSize: 18, fontWeight: 800 }}>What the room is telling you</div>
            </div>
            <Flame className="lucide-small" />
          </div>
          <div className="gb-hot-grid">
            <div className="gb-hot-card gb-stack-1">
              <div className="gb-label">Hot market</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                {hotInsights.hottestMarket ? hotInsights.hottestMarket.market.title : "Waiting for the first slip"}
              </div>
              <div className="gb-helper" style={{ margin: 0 }}>
                {hotInsights.hottestMarket?.topOption && hotInsights.hottestMarket.totalTickets > 0
                  ? `Most backed: ${hotInsights.hottestMarket.topOption.label}`
                  : "No movement yet"}
              </div>
            </div>
            <div className="gb-hot-card gb-stack-1">
              <div className="gb-label">Popular multi</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                {popularCombo ? popularCombo.label : "No repeat multi yet"}
              </div>
              <div className="gb-helper" style={{ margin: 0 }}>
                {popularCombo ? `Backed ${popularCombo.count} times` : "The field is still finding its read"}
              </div>
            </div>
            <div className="gb-hot-card gb-stack-1">
              <div className="gb-label">Quiet outsider</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                {hotInsights.quietOutsider ? hotInsights.quietOutsider.label : "No market yet"}
              </div>
              <div className="gb-helper" style={{ margin: 0 }}>
                {hotInsights.quietOutsider ? `${hotInsights.quietOutsider.odds} • ${hotInsights.quietOutsider.marketTitle}` : "Waiting for opening action"}
              </div>
            </div>
          </div>
        </div>

        <LatestLockedCard bet={latestBet} />

        <MarqueeTicker items={tickerItems} />

        <div className="gb-tabbar">
          {[
            { key: "build", label: "Build" },
            { key: "confirmed", label: "Slip" },
            { key: "bridal", label: bridalPartyCount ? `Bridal (${bridalPartyCount})` : "Bridal" },
            { key: "history", label: "History" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveView(tab.key as "build" | "confirmed" | "history" | "bridal")} className={cx("gb-tab", activeView === tab.key && "gb-tab--active")}>
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeView === "build" && (
            <motion.div key="build" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="gb-stack-3">
              <Card>
                <CardHeader>
                  <CardTitle className="gb-row" style={{ fontSize: 17, fontWeight: 700 }}>
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

              <Card className={pulseSlip ? "gb-slip-panel--pulse" : ""}>
                <CardHeader>
                  <CardTitle className="gb-row" style={{ fontSize: 17, fontWeight: 700 }}>
                    <div className="gb-marketicon">
                      <Receipt className="lucide-small" />
                    </div>
                    <span>Current slip</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="gb-stack-2">
                  <div className="gb-row">
                    <Badge className={betType === "single" ? "gb-badge--rose" : "gb-badge--stone"}>Single</Badge>
                    <Badge className={betType === "multi" ? "gb-badge--rose" : "gb-badge--stone"}>Multi</Badge>
                    {selections.length ? <Badge className="gb-badge--success">{selections.length} selected</Badge> : null}
                  </div>

                  <div className="gb-softbox gb-stack-2" style={{ background: "var(--stone-50)", borderColor: "var(--stone-200)", color: "var(--stone-900)" }}>
                    <div className="gb-between">
                      <div>
                        <div className="gb-label">Bet type</div>
                        <div style={{ marginTop: 4, fontSize: 17, fontWeight: 700, textTransform: "capitalize" }}>{betType}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="gb-label">Combined odds</div>
                        <div style={{ marginTop: 4, fontSize: 17, fontWeight: 700, color: "var(--rose-900)" }}>{combinedOdds}</div>
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
                        <button key={`${item.marketId}-${item.option}`} className="gb-chip-button" onClick={() => removeSelection(item)}>
                          <span>{item.option} {item.odds}</span>
                          <Trash2 className="lucide-small" />
                        </button>
                      ))
                    ) : (
                      <div className="gb-muted" style={{ fontSize: 14 }}>Build your slip to get started</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="gb-action-row">
                <Button variant="soft" onClick={expandAllCategories}>Expand all</Button>
                <Button variant="soft" onClick={collapseAllCategories}>Collapse all</Button>
              </div>

              {Object.entries(groupedMarkets).map(([category, categoryMarkets]) => {
                const isCollapsed = !!collapsedCategories[category];
                const totalCategoryMarkets = categoryMarkets.length;
                const selectedInCategory = selections.filter((selection) => categoryMarkets.some((market) => market.id === selection.marketId)).length;
                const CategoryIcon = CATEGORY_ICONS[category] || Ticket;

                return (
                  <div key={category} className="gb-stack-2">
                    <button className="gb-category-toggle" onClick={() => toggleCategory(category)}>
                      <div className="gb-category-toggle-left">
                        <div className="gb-marketicon">
                          <CategoryIcon className="lucide-small" />
                        </div>
                        <div className="gb-category-toggle-copy">
                          <div className="gb-category-toggle-title">{category}</div>
                          <div className="gb-market-meta">{totalCategoryMarkets} market{totalCategoryMarkets === 1 ? "" : "s"} • {selectedInCategory} pick{selectedInCategory === 1 ? "" : "s"}</div>
                          <div className="gb-helper" style={{ margin: 0 }}>{isCollapsed ? "Tap to view markets" : "Tap to hide markets"}</div>
                        </div>
                      </div>
                      {isCollapsed ? <ChevronDown className="lucide-small" /> : <ChevronUp className="lucide-small" />}
                    </button>

                    {!isCollapsed ? categoryMarkets.map((market, idx) => {
                      const Icon = market.icon;
                      const selectedCount = selections.filter((item) => item.marketId === market.id).length;
                      const marketTickets = market.options.reduce((sum, option) => sum + (option.tickets || 0), 0);
                      const mostBacked = market.options.reduce<MarketOption | null>((best, option) => {
                        if (!best) return option;
                        return (option.tickets || 0) > (best.tickets || 0) ? option : best;
                      }, null);

                      return (
                        <Card key={market.id}>
                          <CardHeader>
                            <CardTitle className="gb-between">
                              <div className="gb-row gb-col">
                                <div className="gb-marketicon">
                                  <Icon className="lucide-small" />
                                </div>
                                <div className="gb-col">
                                  <div className="gb-label">{category} • Market {idx + 1}</div>
                                  <div style={{ marginTop: 4, fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>{market.title}</div>
                                  <div className="gb-market-meta">
                                    {mostBacked && (mostBacked.tickets || 0) > 0 ? `Most backed: ${mostBacked.label}` : formatTicketCount(marketTickets)}
                                  </div>
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                {market.spotlight ? <Badge className="gb-badge--spotlight">Spotlight</Badge> : null}
                                {selectedCount > 0 ? <div style={{ marginTop: market.spotlight ? 8 : 0 }}><Badge className="gb-badge--selected">{selectedCount} selected</Badge></div> : null}
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
                    }) : null}
                  </div>
                );
              })}
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
                <EmptyState title="No confirmed slip yet" body="Build your slip first, then lock it in." />
              )}
            </motion.div>
          )}

          {activeView === "bridal" && (
            <motion.div key="bridal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="gb-stack-3">
              <Card>
                <CardHeader>
                  <CardTitle style={{ fontSize: 17, fontWeight: 700 }}>Bridal Party Picks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="gb-helper">Watch the bridal party, copy their picks, or try to beat them with your own read.</div>
                </CardContent>
              </Card>

              {bridalPartyEntries.map((entry) => (
                <BridalPartyCard key={entry.key} person={entry} bet={entry.bet} onTail={(bet) => loadSlipFromBet(bet, entry.display)} />
              ))}
            </motion.div>
          )}

          {activeView === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="gb-stack-3">
              <Card>
                <CardHeader>
                  <CardTitle style={{ fontSize: 17, fontWeight: 700 }}>Find submitted bets</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input value={lookupName} onChange={(e) => setLookupName(e.target.value)} placeholder="Enter your name" />
                </CardContent>
              </Card>

              {loading ? (
                <EmptyState title="Loading bets" body="Pulling locked slips from the cloud." />
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

                    <div className="gb-history-actions">
                      <Button variant="soft" onClick={() => loadSlipFromBet(bet, bet.bettor_name)}>
                        <Copy className="lucide-small" /> Reuse this slip
                      </Button>
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
          <div className={cx("gb-slip-panel gb-stack-2", pulseSlip && "gb-slip-panel--pulse")}>
            <div className="gb-between">
              <div>
                <div className="gb-label">Bet slip</div>
                <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700 }}>
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
            initial={{ opacity: 0, scale: 0.88, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
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
