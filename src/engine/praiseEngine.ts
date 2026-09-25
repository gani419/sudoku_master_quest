export interface PraiseMessage {
  text: string;
  emoji: string;
  subtext?: string;
}

const SECTION_CLEARED_PRAISES: PraiseMessage[] = [
  { text: 'Cooking!', emoji: '👨‍🍳', subtext: 'That was clean!' },
  { text: 'Big Brain!', emoji: '🧠', subtext: 'Galaxy brain deduction.' },
  { text: 'Locked In!', emoji: '🎯', subtext: 'Unstoppable rhythm!' },
  { text: 'Pure Precision!', emoji: '✨', subtext: 'Surgical accuracy.' },
  { text: 'Flawless!', emoji: '⚡', subtext: 'Keep that momentum.' },
  { text: 'Masterclass!', emoji: '👑', subtext: 'Top tier placement.' },
];

const COMBO_PRAISES: PraiseMessage[] = [
  { text: 'Combo Streak x3!', emoji: '🔥', subtext: 'You are on fire!' },
  { text: 'Speed Demon!', emoji: '⚡', subtext: 'Blazing through the grid!' },
  { text: 'In The Zone!', emoji: '🚀', subtext: 'Flow state achieved!' },
];

const TIME_WARNING_ENCOURAGEMENTS: PraiseMessage[] = [
  { text: 'Focus Up!', emoji: '⏳', subtext: "Clock's ticking, finish strong!" },
  { text: 'You Got This!', emoji: '💪', subtext: 'Breathe and spot the pattern!' },
  { text: 'Final Sprint!', emoji: '🏁', subtext: 'Push through to the finish!' },
];

const OVERTIME_CUSHION_MESSAGES: PraiseMessage[] = [
  {
    text: 'Almost Had It!',
    emoji: '🤝',
    subtext: 'You were breaking that board down! Grab extra time & seal the win.',
  },
  {
    text: 'Tough Board!',
    emoji: '🛡️',
    subtext: "Mistakes are just reps for the brain. Add bonus time and let's run it.",
  },
  {
    text: 'Never Give Up!',
    emoji: '🔥',
    subtext: 'The best players clutch from behind. Extend the clock now!',
  },
];

const VICTORY_HYPE_MESSAGES: PraiseMessage[] = [
  { text: 'Certified GOAT Moves!', emoji: '🏆', subtext: 'Crushed that puzzle!' },
  { text: 'Absolute Legend!', emoji: '🌟', subtext: 'That board stood no chance.' },
  { text: 'Mind Blown!', emoji: '🤯', subtext: 'Flawless problem solving!' },
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const praiseEngine = {
  getSectionClearPraise: (): PraiseMessage => {
    return getRandomItem(SECTION_CLEARED_PRAISES);
  },

  getComboPraise: (): PraiseMessage => {
    return getRandomItem(COMBO_PRAISES);
  },

  getTimeWarningPraise: (): PraiseMessage => {
    return getRandomItem(TIME_WARNING_ENCOURAGEMENTS);
  },

  getOvertimeCushion: (): PraiseMessage => {
    return getRandomItem(OVERTIME_CUSHION_MESSAGES);
  },

  getVictoryHype: (): PraiseMessage => {
    return getRandomItem(VICTORY_HYPE_MESSAGES);
  },
};
