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
  ChevronLeft,
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

type InnerCircleMeta = {
  key: string;
  display: string;
  role: string;
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "soft";
};

type View = "build" | "confirmed" | "history" | "inner";

const supabaseUrl = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined;
const supabasePublishableKey = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY : undefined;
const supabase = supabaseUrl && supabasePublishableKey ? createClient(supabaseUrl, supabasePublishableKey) : null;

const DRAFT_KEY = "groomsday_betting_draft_v11";
const NAME_KEY = "groomsday_last_bettor_name_v1";
const DRIFT_STRENGTH = 0.42;
function getRandomQuickStartIds() {
  const shuffled = [...BASE_MARKETS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4).map((market) => market.id);
}

const INNER_CIRCLE: InnerCircleMeta[] = [
  { key: "abbie", display: "Abbie", role: "Sister of the Groom" },
  { key: "jemima", display: "Jemima", role: "Other Sister of the Groom" },
  { key: "sophie", display: "Sophie", role: "Maid of Honour" },
  { key: "emma", display: "Emma", role: "Mother of Bride" },
  { key: "kirsten", display: "Kirsten", role: "Mother of the Groom" },
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
    id: "anytime_cries",
    title: "Anytime cries (pick as many as you want)",
    category: "Speeches",
    icon: Heart,
    options: [
      { label: "Kirsten Wren", baseOdds: "$1.65" },
      { label: "Wayne Grech", baseOdds: "$1.65" },
      { label: "Sophie Wyatt Smith", baseOdds: "$1.85" },
      { label: "Phoebe Grech", baseOdds: "$3.40" },
      { label: "Abigail Wren", baseOdds: "$3.40" },
      { label: "Jemima Wren", baseOdds: "$3.40" },
      { label: "Helen Heazlewood", baseOdds: "$5.80" },
      { label: "Dinah Heap", baseOdds: "$5.80" },
      { label: "Joseph Bianco", baseOdds: "$5.80" },
      { label: "Ethan Wren", baseOdds: "$5.80" },
      { label: "Any other family member", baseOdds: "$7.50" },
      { label: "Any other bridal party member", baseOdds: "$8.50" },
      { label: "Any other guest", baseOdds: "$13.00" },
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
    id: "ceremony_weather",
    title: "Weather at the time of ceremony",
    category: "Ceremony",
    icon: Sparkles,
    spotlight: true,
    options: [
      { label: "Sunny", baseOdds: "$1.75" },
      { label: "Partly cloudy", baseOdds: "$2.30" },
      { label: "Overcast", baseOdds: "$4.20" },
      { label: "Windy", baseOdds: "$5.50" },
      { label: "Light rain", baseOdds: "$8.00" },
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
    spotlight: true,
    options: [
      { label: "Chocolate", baseOdds: "$1.60" },
      { label: "Red velvet", baseOdds: "$2.20" },
      { label: "Vanilla", baseOdds: "$3.60" },
      { label: "Lemon", baseOdds: "$5.40" },
    ],
  },
  {
    id: "bouquet_toss",
    title: "Who catches the bouquet?",
    category: "Reception",
    icon: Sparkles,
    options: [
      { label: "Someone who is currently single", baseOdds: "$1.70" },
      { label: "Someone who is currently in a relationship", baseOdds: "$2.80" },
      { label: "Joseph Bianco", baseOdds: "$8.50" },
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
      { label: "Energy drink", baseOdds: "$3.40" },
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
    spotlight: true,
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

const QUICK_START_LABEL = "Quick Start";
const ALL_LABEL = "All Markets";
const CELEBS_LABEL = "VIP Picks";
const ALL_MARKET_CATEGORIES = Array.from(new Set(BASE_MARKETS.map((market) => market.category)));
const SECTION_OPTIONS = [ALL_LABEL, CELEBS_LABEL];

const styles = `
  :root {
    --rose-25: #fffafc;
    --rose-50: #fff3f7;
    --rose-75: #ffedf4;
    --rose-100: #ffe3ee;
    --rose-150: #ffd2e4;
    --rose-200: #fec5da;
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
    --font-body: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Avenir Next", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Avenir Next", "Helvetica Neue", Arial, sans-serif;
    --shadow-sm: 0 8px 18px rgba(28, 25, 23, 0.05);
    --shadow-lg: 0 14px 28px rgba(28, 25, 23, 0.07);
    --shadow-xl: 0 18px 40px rgba(28, 25, 23, 0.11);
    --radius-xl: 16px;
    --radius-2xl: 22px;
    --radius-3xl: 28px;
  }

  * { box-sizing: border-box; }

  .gb-app {
    min-height: 100vh;
    color: var(--stone-900);
    background:
      radial-gradient(circle at top, rgba(251, 207, 232, 0.55), transparent 32%),
      linear-gradient(180deg, #fff9f8 0%, #faf7f6 100%);
    font-family: var(--font-body);
    line-height: 1.45;
    letter-spacing: -0.012em;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  .gb-app button,
  .gb-app input { font: inherit; }

  .gb-serif {
    font-family: var(--font-display);
    font-weight: 700;
    letter-spacing: -0.045em;
  }

  .lucide-small { width: 16px; height: 16px; flex: 0 0 16px; }
  .lucide-icon { width: 22px; height: 22px; }

  .gb-topbar {
    position: sticky;
    top: 0;
    z-index: 40;
    padding: 10px 16px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 10px;
    font-weight: 700;
    color: var(--rose-900);
    background: rgba(255, 241, 245, 0.9);
    border-bottom: 1px solid var(--rose-200);
    backdrop-filter: blur(10px);
  }

  .gb-page {
    max-width: 460px;
    margin: 0 auto;
    min-height: 100vh;
    padding: 14px 14px calc(88px + env(safe-area-inset-bottom, 0px));
  }

  .gb-stack-1 > * + * { margin-top: 6px; }
  .gb-stack-2 > * + * { margin-top: 10px; }
  .gb-stack-3 > * + * { margin-top: 14px; }
  .gb-stack-4 > * + * { margin-top: 18px; }

  .gb-card,
  .gb-hero,
  .gb-sheet,
  .gb-history-card,
  .gb-slip-panel,
  .gb-confirm,
  .gb-empty,
  .gb-inner-card,
  .gb-market-card,
  .gb-summary-card {
    background: rgba(255, 255, 255, 0.94);
    border: 1px solid var(--stone-200);
    border-radius: var(--radius-3xl);
    box-shadow: var(--shadow-lg);
    padding: 14px;
    backdrop-filter: blur(8px);
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

  .gb-col { min-width: 0; }

  .gb-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .gb-eyebrow,
  .gb-label,
  .gb-micro,
  .gb-section-kicker {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 10px;
  }

  .gb-eyebrow,
  .gb-section-kicker { color: var(--rose-700); font-weight: 700; }
  .gb-label,
  .gb-micro { color: var(--stone-500); }

  .gb-title {
    margin: 4px 0 0;
    font-size: 32px;
    line-height: 1;
    font-weight: 700;
    letter-spacing: -0.05em;
    color: var(--stone-900);
  }

  .gb-subtitle,
  .gb-helper,
  .gb-muted,
  .gb-empty-body { color: var(--stone-500); }

  .gb-subtitle { margin: 6px 0 0; font-size: 13px; line-height: 1.5; max-width: 34ch; }
  .gb-helper { margin: 6px 0 0; font-size: 12px; }
  .gb-empty-body { margin: 6px 0 0; font-size: 14px; }

  .gb-iconbox,
  .gb-marketicon,
  .gb-inner-avatar,
  .gb-stat-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-xl);
    background: linear-gradient(180deg, var(--rose-50) 0%, var(--rose-75) 100%);
    color: var(--rose-700);
  }

  .gb-iconbox { width: 44px; height: 44px; flex: 0 0 44px; }
  .gb-marketicon,
  .gb-stat-icon { width: 34px; height: 34px; flex: 0 0 34px; }
  .gb-inner-avatar { width: 42px; height: 42px; flex: 0 0 42px; }

  .gb-inner-avatar--abbie {
    background: linear-gradient(180deg, var(--rose-100) 0%, var(--rose-75) 100%);
    color: var(--rose-900);
  }

  .gb-inner-avatar--sophie {
    background: linear-gradient(180deg, var(--mauve-100) 0%, #faf5ff 100%);
    color: var(--mauve-700);
  }

  .gb-inner-avatar--emma {
    background: linear-gradient(180deg, var(--sage-50) 0%, #fbfdf9 100%);
    color: var(--sage-700);
  }

  .gb-inner-avatar--jemima {
    background: linear-gradient(180deg, var(--mauve-100) 0%, #fff7ff 100%);
    color: var(--mauve-700);
  }

  .gb-inner-avatar--kirsten {
    background: linear-gradient(180deg, var(--rose-50) 0%, var(--rose-25) 100%);
    color: var(--rose-800);
  }

  .gb-banner,
  .gb-softbox,
  .gb-badge,
  .gb-option,
  .gb-leg,
  .gb-input,
  .gb-oddsbox,
  .gb-toast,
  .gb-success,
  .gb-chip-button,
  .gb-filter-chip,
  .gb-searchbar {
    border: 1px solid var(--stone-200);
    border-radius: var(--radius-2xl);
  }

  .gb-banner,
  .gb-softbox {
    background: linear-gradient(180deg, var(--rose-50) 0%, var(--rose-25) 100%);
    border-color: var(--rose-200);
    color: var(--rose-900);
    padding: 12px;
  }

  .gb-banner { text-align: left; font-size: 13px; font-weight: 700; }
  .gb-start-box {
    display: grid;
    gap: 10px;
  }

  .gb-start-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    border-radius: 999px;
    background: var(--rose-100);
    color: var(--rose-900);
    font-size: 11px;
    font-weight: 700;
    width: fit-content;
  }

  .gb-searchbar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.96);
    padding: 0 12px;
    box-shadow: var(--shadow-sm);
  }

  .gb-search-input {
    border: 0;
    outline: none;
    background: transparent;
    width: 100%;
    height: 44px;
    color: var(--stone-900);
    font-size: 15px;
  }

  .gb-search-input::placeholder { color: var(--stone-400); }

  .gb-chip-row {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: none;
  }

  .gb-chip-row::-webkit-scrollbar { display: none; }

  .gb-filter-chip {
    background: rgba(255,255,255,0.94);
    color: var(--stone-700);
    border-color: var(--stone-200);
    padding: 9px 12px;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
  }

  .gb-filter-chip--active {
    background: linear-gradient(180deg, var(--rose-100) 0%, var(--rose-75) 100%);
    color: var(--rose-900);
    border-color: var(--rose-200);
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
  .gb-input:focus { border-color: var(--rose-300); box-shadow: 0 0 0 3px rgba(244,114,182,0.1); }

  .gb-market-list { display: grid; gap: 12px; }

  .gb-market-card { padding: 0; overflow: hidden; }

  .gb-market-head {
    padding: 14px 14px 10px;
    border-bottom: 1px solid var(--stone-150);
  }

  .gb-market-title {
    margin-top: 4px;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.02em;
  }

  .gb-market-body {
    padding: 10px 14px 14px;
    display: grid;
    gap: 10px;
  }

  .gb-market-group-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 800;
    margin-bottom: 2px;
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
  .gb-option:hover { box-shadow: var(--shadow-sm); }

  .gb-option--active {
    border-color: var(--rose-300);
    background: linear-gradient(180deg, var(--rose-50) 0%, var(--rose-25) 100%);
    box-shadow: 0 0 0 1px rgba(190,24,93,0.08), var(--shadow-sm);
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
    line-height: 1.36;
    letter-spacing: -0.005em;
    color: var(--stone-900);
    flex: 1 1 auto;
  }

  .gb-checkmark { color: var(--rose-700); flex: 0 0 auto; margin-top: 1px; }

  .gb-movement-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
    font-size: 10px;
    color: var(--stone-500);
  }

  .gb-opened-subtle { font-size: 10px; color: var(--stone-400); }

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
    font-variant-numeric: tabular-nums;
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
    scrollbar-width: none;
  }

  .gb-selection-scroll::-webkit-scrollbar { display: none; }

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

  .gb-chip-button:hover { box-shadow: var(--shadow-sm); }

  .gb-slip-fab-wrap {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    padding: 0 14px calc(10px + env(safe-area-inset-bottom, 0px));
    pointer-events: none;
  }

  .gb-slip-fab-inner {
    max-width: 460px;
    margin: 0 auto;
    pointer-events: auto;
  }

  .gb-slip-fab {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid var(--stone-200);
    border-radius: 999px;
    background: rgba(255,255,255,0.98);
    box-shadow: var(--shadow-xl);
    cursor: pointer;
    transition: transform 160ms ease, box-shadow 160ms ease;
  }

  .gb-slip-fab:hover { box-shadow: var(--shadow-xl); }
  .gb-slip-fab:active { transform: scale(0.99); }
  .gb-slip-fab--pulse {
    box-shadow: 0 0 0 1px rgba(190,24,93,0.12), var(--shadow-xl);
    transform: translateY(-2px);
  }

  .gb-slip-fab-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: left;
  }

  .gb-slip-fab-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--stone-900);
    letter-spacing: -0.02em;
  }

  .gb-slip-fab-subtitle {
    font-size: 12px;
    color: var(--stone-500);
  }

  .gb-slip-panel {
    background: rgba(255,255,255,0.98);
    padding: 14px;
    transition: box-shadow 160ms ease, transform 160ms ease;
    box-shadow: var(--shadow-xl);
  }

  .gb-slip-backdrop {
    position: fixed;
    inset: 0;
    z-index: 44;
    background: rgba(28, 25, 23, 0.22);
    backdrop-filter: blur(2px);
  }

  .gb-slip-drawer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 45;
    padding: 0 14px calc(10px + env(safe-area-inset-bottom, 0px));
  }

  .gb-slip-drawer-inner {
    max-width: 460px;
    margin: 0 auto;
  }

  .gb-slip-drawer-handle {
    width: 44px;
    height: 5px;
    border-radius: 999px;
    background: var(--stone-300);
    margin: 0 auto 12px;
  }

  .gb-slip-panel--pulse {
    box-shadow: 0 0 0 1px rgba(190,24,93,0.12), var(--shadow-xl);
    transform: translateY(-2px);
  }

  .gb-button-row,
  .gb-action-row,
  .gb-secondary-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .gb-inner-buttons { display: grid; gap: 10px; }

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

  .gb-button:hover { box-shadow: var(--shadow-sm); }
  .gb-button:active { transform: scale(0.99); }
  .gb-button:disabled { opacity: 0.5; cursor: default; box-shadow: none; }
  .gb-button--default { background: linear-gradient(180deg, var(--rose-100) 0%, var(--rose-150) 100%); color: var(--rose-900); }
  .gb-button--outline { background: var(--white); color: var(--stone-900); }
  .gb-button--soft { background: linear-gradient(180deg, var(--stone-50) 0%, var(--stone-25) 100%); color: var(--stone-900); }

  .gb-sheet {
    padding: 0;
    overflow: hidden;
  }

  .gb-sheet-header {
    padding: 14px;
    border-bottom: 1px solid var(--stone-150);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .gb-sheet-body {
    padding: 14px;
  }

  .gb-confirm { background: var(--white); max-width: 420px; margin: 0 auto; }

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

  .gb-leg {
    background: linear-gradient(180deg, var(--stone-50) 0%, var(--stone-25) 100%);
    padding: 10px 12px;
  }

  .gb-history-list,
  .gb-inner-grid,
  .gb-market-group,
  .gb-insight-grid {
    display: grid;
    gap: 10px;
  }

  .gb-empty { text-align: center; }

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

  .gb-section-divider {
    margin-top: 4px;
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .gb-category-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid var(--stone-200);
    border-radius: var(--radius-2xl);
    background: rgba(255,255,255,0.96);
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    text-align: left;
  }

  .gb-category-toggle-title {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--stone-900);
  }

  .gb-inner-card {
    position: relative;
    overflow: hidden;
  }

  .gb-inner-card::after {
    content: "";
    position: absolute;
    inset: auto -18% -44px auto;
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba(249,168,212,0.2), transparent 68%);
    pointer-events: none;
  }

  .gb-inner-status {
    font-size: 13px;
    font-weight: 700;
    color: var(--stone-900);
    line-height: 1.4;
  }

  .gb-inner-name {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  .gb-inner-role {
    margin-top: 4px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    color: var(--stone-500);
    letter-spacing: 0.04em;
  }

  @media (max-width: 460px) {
    .gb-page {
      padding-left: 12px;
      padding-right: 12px;
      padding-bottom: calc(92px + env(safe-area-inset-bottom, 0px));
    }

    .gb-slip-fab-wrap,
    .gb-slip-drawer {
      padding-left: 12px;
      padding-right: 12px;
    }

    .gb-title { font-size: 28px; }
    .gb-grid-2,
    .gb-button-row,
    .gb-action-row,
    .gb-secondary-actions,
    .gb-insight-grid {
      grid-template-columns: 1fr;
    }

    .gb-market-head,
    .gb-market-body,
    .gb-sheet-header,
    .gb-sheet-body { padding-left: 12px; padding-right: 12px; }

    .gb-option { padding: 11px; }
    .gb-oddsbox { min-width: 76px; padding: 7px 9px; }
    .gb-odds-main { font-size: 17px; }
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
  return (
    <button
      {...props}
      className={cx(
        "gb-button",
        variant === "outline" ? "gb-button--outline" : variant === "soft" ? "gb-button--soft" : "gb-button--default",
        className
      )}
    >
      {children}
    </button>
  );
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
  if (!selections?.length) return "No picks yet";
  return selections.map((selection) => selection.option).join(" • ");
}

function buildSelectionsContextText(selections: Selection[], limit = 3) {
  if (!selections?.length) return [];
  return selections.slice(0, limit).map((selection) => `${selection.marketTitle}: ${selection.option}`);
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

function getInnerCircleIcon(person: InnerCircleMeta): IconComponent {
  if (person.key === "abbie") return Users;
  if (person.key === "jemima") return Crown;
  if (person.key === "sophie") return Sparkles;
  if (person.key === "kirsten") return Heart;
  return Heart;
}

function normalizeSlipSignature(selections: Selection[]) {
  return selections.map((selection) => `${selection.marketId}:${selection.option}`).sort().join("|");
}

function runSanityChecks() {
  console.assert(parseOdds("$2.10") === 2.1, "parseOdds should parse decimal odds");
  console.assert(formatOdds(3.456) === "$3.46", "formatOdds should round to 2 decimals");
  console.assert(
    calcCombinedOdds([{ marketId: "a", marketTitle: "A", option: "X", odds: "$2.00" }]) === "$2.00",
    "single combined odds should match single leg"
  );
}

if (typeof window !== "undefined") {
  runSanityChecks();
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

function InnerCircleCard({
  person,
  bet,
  onTail,
}: {
  person: InnerCircleMeta;
  bet: StoredBet | null;
  onTail: (bet: StoredBet) => void;
}) {
  const RoleIcon = getInnerCircleIcon(person);

  return (
    <div className="gb-inner-card gb-stack-2">
      <div className="gb-between">
        <div className="gb-row gb-col">
          <div
            className={cx(
              "gb-inner-avatar",
              person.key === "abbie" && "gb-inner-avatar--abbie",
              person.key === "jemima" && "gb-inner-avatar--jemima",
              person.key === "sophie" && "gb-inner-avatar--sophie",
              person.key === "emma" && "gb-inner-avatar--emma",
              person.key === "kirsten" && "gb-inner-avatar--kirsten"
            )}
          >
            <RoleIcon className="lucide-small" />
          </div>
          <div className="gb-col">
            <div className="gb-inner-name">{person.display}</div>
            <div className="gb-inner-role">
              <RoleIcon className="lucide-small" />
              <span>{person.role}</span>
            </div>
          </div>
        </div>
        <Badge className={bet ? "gb-badge--rose" : "gb-badge--stone"}>{bet ? "Slip lodged" : "Awaiting slip"}</Badge>
      </div>

      {bet ? (
        <>
          <div className="gb-inner-status">{buildSelectionsText(bet.selections)}</div>
          <div className="gb-between">
            <div className="gb-helper">Combined odds</div>
            <Badge className="gb-badge--white">{calcCombinedOdds(bet.selections || [])}</Badge>
          </div>
          <div className="gb-inner-buttons">
            <Button variant="soft" onClick={() => onTail(bet)}>
              <Copy className="lucide-small" /> Tail these picks
            </Button>
          </div>
        </>
      ) : (
        <div className="gb-helper">Awaiting their picks. Once they lock in, you can copy their slip here.</div>
      )}
    </div>
  );
}

const SlipPreview = React.forwardRef<HTMLDivElement, { bet: StoredBet }>(({ bet }, ref) => {
  return (
    <div ref={ref} className="gb-confirm gb-stack-3">
      <div className="gb-confirm-banner">Bet confirmed</div>

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
  const [activeView, setActiveView] = useState<View>("build");
  const [activeSection, setActiveSection] = useState<string>(ALL_LABEL);
  const [quickStartIds, setQuickStartIds] = useState<string[]>(() => getRandomQuickStartIds());
  const [collapsedAllMarkets, setCollapsedAllMarkets] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ALL_MARKET_CATEGORIES.map((category) => [category, true]))
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [latestBet, setLatestBet] = useState<StoredBet | null>(null);
  const [lookupName, setLookupName] = useState("");
  const [toast, setToast] = useState("");
  const [flashKey, setFlashKey] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [pulseSlip, setPulseSlip] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [slipOpen, setSlipOpen] = useState(false);
  const slipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const draft = loadDraft();
    setName(draft.name || loadLastName() || "");
    setSelections(draft.selections || []);
    setHasStarted(Boolean((draft.name || loadLastName() || "").trim() || (draft.selections || []).length));
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

      return { ...market, options };
    });
  }, [bets]);

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

  const filteredMarkets = useMemo(() => {
    if (activeSection === QUICK_START_LABEL) {
      return markets.filter((market) => quickStartIds.includes(market.id));
    }

    return markets;
  }, [markets, activeSection, quickStartIds]);

  const groupedFilteredMarkets = useMemo(() => {
    return filteredMarkets.reduce<Record<string, Market[]>>((acc, market) => {
      if (!acc[market.category]) acc[market.category] = [];
      acc[market.category].push(market);
      return acc;
    }, {});
  }, [filteredMarkets]);

  const innerCircleEntries = useMemo(() => {
    return INNER_CIRCLE.map((person) => {
      const bet = bets.find((entry) => entry.bettor_name.toLowerCase().includes(person.key)) || null;
      return { ...person, bet };
    });
  }, [bets]);

  const innerCircleCount = useMemo(() => innerCircleEntries.filter((entry) => !!entry.bet).length, [innerCircleEntries]);

  const myBets = useMemo(() => {
    const normalized = lookupName.toLowerCase().trim();
    if (!normalized) return [];
    return bets.filter((bet) => bet.bettor_name.toLowerCase().trim().includes(normalized));
  }, [lookupName, bets]);

  const popularCombo = useMemo(() => {
    const combos = new Map<string, { label: string[]; count: number }>();

    bets.filter((bet) => bet.bet_type === "multi").forEach((bet) => {
      const signature = normalizeSlipSignature(bet.selections || []);
      const label = buildSelectionsContextText(bet.selections || [], 3);
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

    const hottestMarket = [...marketStats].sort((a, b) => b.totalTickets - a.totalTickets)[0] || null;

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
      .sort((a, b) => parseOdds(b.odds) - parseOdds(a.odds))[0] ||
      [...allOptions].sort((a, b) => parseOdds(b.odds) - parseOdds(a.odds))[0] ||
      null;

    return { hottestMarket, quietOutsider };
  }, [markets]);

  const tickerItems = useMemo(() => {
    const items: string[] = [];

    if (latestBet) {
      items.push(`${latestBet.bettor_name} locked in ${latestBet.bet_type}: ${buildSelectionsText(latestBet.selections)}`);
    }

    innerCircleEntries.forEach((entry) => {
      if (entry.bet) items.push(`${entry.display} has lodged a slip at ${calcCombinedOdds(entry.bet.selections)}`);
    });

    if (hotInsights.hottestMarket?.topOption && hotInsights.hottestMarket.totalTickets > 0) {
      items.push(`Hot right now: ${hotInsights.hottestMarket.topOption.label} leads ${hotInsights.hottestMarket.market.title}`);
    }

    if (popularCombo && popularCombo.count > 1) {
      items.push(`Popular multi: ${popularCombo.label.join(" • ")} backed ${popularCombo.count} times`);
    }

    return items.slice(0, 5);
  }, [latestBet, innerCircleEntries, hotInsights, popularCombo]);

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

  function startExperience() {
    if (!name.trim()) {
      setToast("Enter your name first");
      return;
    }
    setHasStarted(true);
    setToast("Pick from any market below");
  }

  function toggleSelection(market: Market, option: MarketOption) {
    const exists = selections.some((item) => item.marketId === market.id && item.option === option.label);

    if (exists) {
      setSelections((prev) => prev.filter((item) => !(item.marketId === market.id && item.option === option.label)));
      return;
    }

    if (!hasStarted) setHasStarted(true);
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
    setSlipOpen(false);
    setToast("Slip cleared");
  }

  function toggleAllMarketsCategory(category: string) {
    setCollapsedAllMarkets((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }

  function loadSlipFromBet(bet: StoredBet, sourceName: string) {
    setSelections(bet.selections || []);
    setHasStarted(true);
    setActiveView("build");
    setPulseSlip(true);
    setSlipOpen(false);
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
    setSlipOpen(false);
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
    setHasStarted(false);
    setSlipOpen(false);
    setActiveView("build");
    setActiveSection(ALL_LABEL);
    setCollapsedAllMarkets(Object.fromEntries(ALL_MARKET_CATEGORIES.map((category) => [category, true])));
    setQuickStartIds(getRandomQuickStartIds());
    saveDraft({ name: "", selections: [] });
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
                          </div>
            <div className="gb-iconbox">
              <Ticket className="lucide-icon" />
            </div>
          </div>
          <div className="gb-banner gb-stack-1">
            <div>For fun only. No real money will be paid out.</div>
            <div className="gb-helper" style={{ margin: 0, color: "var(--rose-800)" }}>Build a single or a multi and chase bragging rights.</div>
          </div>
        </div>

        <div className="gb-card gb-start-box">
          <div className="gb-start-pill">
            <User className="lucide-small" /> Step 1: start here
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Enter your name</div>
            <div className="gb-helper">Your picks are saved under this name so you can find them later.</div>
          </div>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
          {!hasStarted ? (
            <Button onClick={startExperience}>Start betting</Button>
          ) : (
            <div className="gb-between">
              <Badge className="gb-badge--success">Ready to pick</Badge>
              <Button variant="soft" onClick={() => setActiveView("build")}>Keep building</Button>
            </div>
          )}
        </div>

        {hasStarted ? (
          <AnimatePresence mode="wait">
            {activeView === "build" && (
              <motion.div key="build" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="gb-stack-3">
                <div className="gb-card gb-stack-2">
                  <div className="gb-between">
                    <div>
                      <div className="gb-section-kicker">Step 2</div>
                      <div style={{ marginTop: 4, fontSize: 18, fontWeight: 800 }}>Pick your markets</div>
                    </div>
                    <Badge className="gb-badge--selected">{selections.length} selected</Badge>
                  </div>

                  <div className="gb-chip-row">
                    {SECTION_OPTIONS.map((section) => (
                      <button
                        key={section}
                        className={cx("gb-filter-chip", activeSection === section && section !== CELEBS_LABEL && "gb-filter-chip--active")}
                        onClick={() => {
                          if (section === CELEBS_LABEL) {
                            setActiveView("inner");
                            return;
                          }
                          setActiveSection(section);
                        }}
                      >
                        {section}
                      </button>
                    ))}
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
                      <div className="gb-muted" style={{ fontSize: 14 }}>No picks yet. Tap any option below to get started.</div>
                    )}
                  </div>
                </div>

                <div className="gb-action-row">
                  <Button variant="soft" onClick={() => setShowInsights((prev) => !prev)}>
                    <Flame className="lucide-small" /> {showInsights ? "Hide live pulse" : "Show live pulse"}
                  </Button>
                  <Button variant="soft" onClick={() => setActiveView("inner")}>VIP picks</Button>
                </div>

                {showInsights ? (
                  <div className="gb-insight-grid">
                    <Card>
                      <CardHeader>
                        <CardTitle className="gb-row" style={{ fontSize: 16, fontWeight: 800 }}>
                          <Flame className="lucide-small" />
                          <span>What's hot right now</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="gb-stack-2">
                        <div className="gb-softbox gb-stack-1">
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

                        <div className="gb-softbox gb-stack-1">
                          <div className="gb-label">Popular multi</div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>
                            {popularCombo ? popularCombo.label.map((line, index) => <div key={`combo-line-${index}`}>{line}</div>) : "No repeat multi yet"}
                          </div>
                          <div className="gb-helper" style={{ margin: 0 }}>
                            {popularCombo ? `Backed ${popularCombo.count} times` : "The room is still finding its read"}
                          </div>
                        </div>

                        <div className="gb-softbox gb-stack-1">
                          <div className="gb-label">Quiet outsider</div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>
                            {hotInsights.quietOutsider ? hotInsights.quietOutsider.label : "No market yet"}
                          </div>
                          <div className="gb-helper" style={{ margin: 0 }}>
                            {hotInsights.quietOutsider ? `${hotInsights.quietOutsider.odds} • ${hotInsights.quietOutsider.marketTitle}` : "Waiting for opening action"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    {tickerItems.length ? <Card><CardContent><div className="gb-chip-row">{tickerItems.map((item, idx) => <Badge key={idx} className="gb-badge--rose">{item}</Badge>)}</div></CardContent></Card> : null}
                  </div>
                ) : null}

                {filteredMarkets.length === 0 ? (
                  <EmptyState title="No markets found" body="Try another section." />
                ) : activeSection === ALL_LABEL ? (
                  <div className="gb-market-group">
                    {Object.entries(groupedFilteredMarkets).map(([category, categoryMarkets]) => {
                      const isCollapsed = collapsedAllMarkets[category] ?? true;
                      const selectedInCategory = selections.filter((item) => categoryMarkets.some((market) => market.id === item.marketId)).length;

                      return (
                        <div key={category} className="gb-stack-2">
                          <button className="gb-category-toggle" onClick={() => toggleAllMarketsCategory(category)}>
                            <div className="gb-row gb-col">
                              <div className="gb-marketicon">{React.createElement(CATEGORY_ICONS[category] || Ticket, { className: "lucide-small" })}</div>
                              <div className="gb-col">
                                <div className="gb-category-toggle-title">{category}</div>
                                <div className="gb-helper" style={{ margin: 4 }}>
                                  {categoryMarkets.length} markets • {selectedInCategory} selected
                                </div>
                              </div>
                            </div>
                            {isCollapsed ? <ChevronDown className="lucide-small" /> : <ChevronUp className="lucide-small" />}
                          </button>

                          {!isCollapsed ? (
                            <div className="gb-market-list">
                              {categoryMarkets.map((market) => {
                                const selectedCount = selections.filter((item) => item.marketId === market.id).length;
                                const marketTickets = market.options.reduce((sum, option) => sum + (option.tickets || 0), 0);
                                const mostBacked = market.options.reduce<MarketOption | null>((best, option) => {
                                  if (!best) return option;
                                  return (option.tickets || 0) > (best.tickets || 0) ? option : best;
                                }, null);
                                const Icon = market.icon;

                                return (
                                  <div key={market.id} className="gb-market-card">
                                    <div className="gb-market-head">
                                      <div className="gb-between">
                                        <div className="gb-row gb-col">
                                          <div className="gb-marketicon"><Icon className="lucide-small" /></div>
                                          <div className="gb-col">
                                            <div className="gb-label">{market.spotlight ? "Spotlight" : market.category}</div>
                                            <div className="gb-market-title">{market.title}</div>
                                            <div className="gb-helper" style={{ margin: 4 }}>
                                              {mostBacked && (mostBacked.tickets || 0) > 0 ? `Most backed: ${mostBacked.label}` : `${marketTickets} tickets taken`}
                                            </div>
                                          </div>
                                        </div>
                                        {selectedCount > 0 ? <Badge className="gb-badge--selected">{selectedCount} selected</Badge> : null}
                                      </div>
                                    </div>
                                    <div className="gb-market-body">
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
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="gb-market-list">
                    {filteredMarkets.map((market) => {
                      const selectedCount = selections.filter((item) => item.marketId === market.id).length;
                      const marketTickets = market.options.reduce((sum, option) => sum + (option.tickets || 0), 0);
                      const mostBacked = market.options.reduce<MarketOption | null>((best, option) => {
                        if (!best) return option;
                        return (option.tickets || 0) > (best.tickets || 0) ? option : best;
                      }, null);
                      const Icon = market.icon;

                      return (
                        <div key={market.id} className="gb-market-card">
                          <div className="gb-market-head">
                            <div className="gb-between">
                              <div className="gb-row gb-col">
                                <div className="gb-marketicon"><Icon className="lucide-small" /></div>
                                <div className="gb-col">
                                  <div className="gb-label">{activeSection === QUICK_START_LABEL ? "Quick start" : market.category}</div>
                                  <div className="gb-market-title">{market.title}</div>
                                  <div className="gb-helper" style={{ margin: 4 }}>
                                    {mostBacked && (mostBacked.tickets || 0) > 0 ? `Most backed: ${mostBacked.label}` : `${marketTickets} tickets taken`}
                                  </div>
                                </div>
                              </div>
                              {selectedCount > 0 ? <Badge className="gb-badge--selected">{selectedCount} selected</Badge> : market.spotlight ? <Badge className="gb-badge--spotlight">Start here</Badge> : null}
                            </div>
                          </div>
                          <div className="gb-market-body">
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeView === "confirmed" && (
              <motion.div key="confirmed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="gb-stack-3">
                <div className="gb-sheet">
                  <div className="gb-sheet-header">
                    <div>
                      <div className="gb-section-kicker">Your slip</div>
                      <div style={{ marginTop: 2, fontSize: 16, fontWeight: 800 }}>Confirmed slip</div>
                    </div>
                    <Button variant="soft" onClick={() => setActiveView("build")}>
                      <ChevronLeft className="lucide-small" /> Back
                    </Button>
                  </div>
                  <div className="gb-sheet-body gb-stack-3">
                    {latestBet ? (
                      <>
                        <SlipPreview ref={slipRef} bet={latestBet} />
                        <div className="gb-secondary-actions">
                          <Button onClick={saveAsImage}>
                            <Camera className="lucide-small" /> Save screenshot
                          </Button>
                          <Button variant="soft" onClick={() => setActiveView("history")}>
                            View my saved bets
                          </Button>
                          <Button variant="outline" onClick={startNextBettor}>
                            <RotateCcw className="lucide-small" /> Start next bettor
                          </Button>
                        </div>
                      </>
                    ) : (
                      <EmptyState title="No confirmed slip yet" body="Build your slip first, then lock it in." />
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === "inner" && (
              <motion.div key="inner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="gb-stack-3">
                <div className="gb-sheet">
                  <div className="gb-sheet-header">
                    <div>
                      <div className="gb-section-kicker">VIP picks</div>
                      <div style={{ marginTop: 2, fontSize: 16, fontWeight: 800 }}>Wedding favourites</div>
                    </div>
                    <Button variant="soft" onClick={() => setActiveView("build")}>
                      <ChevronLeft className="lucide-small" /> Back
                    </Button>
                  </div>
                  <div className="gb-sheet-body gb-stack-3">
                    <div className="gb-helper">See what the wedding VIPs are backing, then copy a slip if you like it.</div>
                    <div className="gb-inner-grid">
                      {innerCircleEntries.map((entry) => (
                        <InnerCircleCard key={entry.key} person={entry} bet={entry.bet} onTail={(bet) => loadSlipFromBet(bet, entry.display)} />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === "history" && (
              <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="gb-stack-3">
                <div className="gb-sheet">
                  <div className="gb-sheet-header">
                    <div>
                      <div className="gb-section-kicker">Saved slips</div>
                      <div style={{ marginTop: 2, fontSize: 16, fontWeight: 800 }}>Find my bets</div>
                    </div>
                    <Button variant="soft" onClick={() => setActiveView("build")}>
                      <ChevronLeft className="lucide-small" /> Back
                    </Button>
                  </div>
                  <div className="gb-sheet-body gb-stack-3">
                    <Input value={lookupName} onChange={(e) => setLookupName(e.target.value)} placeholder="Search by name" />
                    {loading ? (
                      <EmptyState title="Loading bets" body="Pulling locked slips from the cloud." />
                    ) : myBets.length ? (
                      <div className="gb-history-list">
                        {myBets.map((bet) => (
                          <div key={bet.id || bet.slip_code} className="gb-history-card gb-stack-2">
                            <div className="gb-between">
                              <div className="gb-col">
                                <div style={{ fontSize: 14, fontWeight: 800 }}>{bet.slip_code}</div>
                                <div className="gb-helper" style={{ margin: 4 }}>
                                  {bet.bet_type} • {formatTime(bet.created_at)}
                                </div>
                              </div>
                              <Badge className="gb-badge--selected">{calcCombinedOdds(bet.selections || [])}</Badge>
                            </div>
                            <div className="gb-softbox gb-stack-1">
                              <div className="gb-label" style={{ color: "var(--rose-700)" }}>Selections</div>
                              <div style={{ fontSize: 14 }}>{buildSelectionsText(bet.selections)}</div>
                            </div>
                            <Button variant="soft" onClick={() => loadSlipFromBet(bet, bet.bettor_name)}>
                              <Copy className="lucide-small" /> Reuse this slip
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState title="No bets found" body="Try the exact name used when the bet was placed." />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ) : null}
      </div>

      {hasStarted && activeView === "build" && selections.length > 0 ? (
        <div className="gb-slip-fab-wrap">
          <div className="gb-slip-fab-inner">
            <button className={cx("gb-slip-fab", pulseSlip && "gb-slip-fab--pulse")} onClick={() => setSlipOpen(true)}>
              <div className="gb-slip-fab-copy">
                <div className="gb-section-kicker">Review slip</div>
                <div className="gb-slip-fab-title">{selections.length} leg{selections.length === 1 ? "" : "s"} • {betType}</div>
                <div className="gb-slip-fab-subtitle">Tap to clear or lock your bet</div>
              </div>
              <Badge className="gb-badge--selected">{combinedOdds}</Badge>
            </button>
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {hasStarted && activeView === "build" && slipOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="gb-slip-backdrop"
              onClick={() => setSlipOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="gb-slip-drawer"
            >
              <div className="gb-slip-drawer-inner">
                <div className="gb-slip-panel gb-stack-2">
                  <div className="gb-slip-drawer-handle" />
                  <div className="gb-between">
                    <div>
                      <div className="gb-section-kicker">Review slip</div>
                      <div style={{ marginTop: 4, fontSize: 16, fontWeight: 700 }}>
                        {selections.length} leg{selections.length === 1 ? "" : "s"} • {betType}
                      </div>
                    </div>
                    <Button variant="soft" onClick={() => setSlipOpen(false)}>
                      Done
                    </Button>
                  </div>

                  <div className="gb-softbox gb-stack-2" style={{ background: "var(--stone-50)", borderColor: "var(--stone-200)", color: "var(--stone-900)" }}>
                    <div className="gb-between">
                      <div>
                        <div className="gb-label">Combined odds</div>
                        <div style={{ marginTop: 4, fontSize: 18, fontWeight: 700, color: "var(--rose-900)" }}>{combinedOdds}</div>
                      </div>
                      <Badge className="gb-badge--selected">{betType}</Badge>
                    </div>
                    <div className="gb-helper" style={{ margin: 0 }}>Your current selections are ready to lock in.</div>
                  </div>

                  <div className="gb-selection-scroll">
                    {selections.map((item) => (
                      <button key={`${item.marketId}-${item.option}`} className="gb-chip-button" onClick={() => removeSelection(item)}>
                        <span>{item.option} {item.odds}</span>
                        <Trash2 className="lucide-small" />
                      </button>
                    ))}
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
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

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
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="gb-toast">
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
