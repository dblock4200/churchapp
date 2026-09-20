export type ID = string;
export type Member = { id: ID; name: string; isLeader?: boolean };

export type Week = {
  id: ID; groupName: string; memberCount: number;
  passageRef: string;
  question: string;
  hostName: string; hostWhen: string; comingCount: number; coming: string[];
  memoryVerseRef: string; memoryVerseText: string;
  youAnswered: boolean;
};

export type Answer = { id: ID; author: string; when: string; text: string };

export type PresencePost = {
  id: ID; author: string; when: string; day: string; text: string; hasPhoto: boolean;
  replies: { id: ID; author: string; when: string; text: string }[];
};

export type PrayerRequest = {
  id: ID; author: string; when: string; text: string;
  onBehalfOf?: string; answered?: boolean;
  followUp?: { prompt: string };
};

export type Verse = { ref: string; text: string };
