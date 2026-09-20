import { Week, Answer, PresencePost, PrayerRequest, Verse, Member } from './types';

export const members: Member[] = [
  { id: 'renee', name: 'Renee', isLeader: true },
  { id: 'marcus', name: 'Marcus' }, { id: 'tom', name: 'Tom' },
  { id: 'maria', name: 'Maria' }, { id: 'andre', name: 'Andre' },
];

export const week: Week = {
  id: 'w-romans8', groupName: 'Tuesday Night', memberCount: 9,
  passageRef: 'Romans 8:18–30',
  question: 'Where have you seen God working in something you didn’t ask for?',
  hostName: 'Renee', hostWhen: 'Tuesday · 7:00pm', comingCount: 6,
  coming: ['Renee', 'Marcus', 'Tom', 'Maria', 'Andre'],
  memoryVerseRef: 'Romans 8:28',
  memoryVerseText: 'And we know that all things work together for good for those who love God, for those who are called according to his purpose.',
  youAnswered: false,
};

export const answers: Answer[] = [
  { id: 'a1', author: 'Marcus', when: 'Sunday', text: 'My truck died in July and Tom drove me to work for nine days. I never would have asked him. I know him now.' },
  { id: 'a2', author: 'Maria', when: 'Sunday', text: 'Losing the house in Mesa. I still don’t have a tidy ending for it. But my kids heard us pray out loud about money for the first time.' },
  { id: 'a3', author: 'Andre', when: 'Monday', text: 'Honestly, not much this week. I’m putting that here anyway.' },
];

export const presence: PresencePost[] = [
  { id: 'p1', author: 'Maria', when: '8:14pm', day: 'Today', hasPhoto: true,
    text: 'Heard “Great Are You Lord” on the radio right as I pulled into the parking lot. I’d been dreading that appointment all week. Not a coincidence.',
    replies: [
      { id: 'r1', author: 'Renee', when: '8:31pm', text: 'Which appointment? I’ve been praying about Thursday for you either way.' },
      { id: 'r2', author: 'Maria', when: '8:40pm', text: 'The follow-up on my mom. It went better than they expected.' },
      { id: 'r3', author: 'Tom', when: '9:06pm', text: 'That song was playing when I dropped Marcus off. Same morning.' },
    ] },
  { id: 'p2', author: 'Andre', when: '6:02pm', day: 'Today', hasPhoto: false,
    text: 'Sat on the porch after work and didn’t reach for my phone for twenty minutes. That’s new for me.', replies: [] },
  { id: 'p3', author: 'Marcus', when: '7:20am', day: 'Monday', hasPhoto: false,
    text: 'Tom drove me to work again. Ninth day.', replies: [] },
];

export const prayers: PrayerRequest[] = [
  { id: 'pr1', author: 'Marcus', when: 'Three weeks ago', text: 'Interview Friday — more nervous than I expected.',
    followUp: { prompt: 'It’s been three weeks. Any word on the interview?' } },
  { id: 'pr2', author: 'Tom', when: 'Sunday', text: 'For my neighbor Dana, who just lost her job.', onBehalfOf: 'someone outside the group' },
  { id: 'pr3', author: 'Maria', when: 'Sunday', text: 'My mom’s surgery is Thursday morning.' },
];

// Verse finder: real, surfaced Scripture (World English Bible — public domain). Never generated.
export const verseQuery = 'angry at someone I see every week';
export const verseSource = 'World English Bible';
export const verses: Verse[] = [
  { ref: 'Ephesians 4:26–27', text: '“Be angry, and don’t sin.” Don’t let the sun go down on your wrath, and don’t give place to the devil.' },
  { ref: 'Romans 12:17–18', text: 'Repay no one evil for evil. Respect what is honorable in the sight of all men. If it is possible, as much as it is up to you, be at peace with all men.' },
  { ref: 'Matthew 18:21–22', text: 'Then Peter came and said to him, “Lord, how often shall my brother sin against me, and I forgive him?”' },
];

export const composePrompts = [
  { key: 'A', label: 'A · Noticing', text: 'What did you notice this week?' },
  { key: 'B', label: 'B · Where God showed up', text: 'Where did you see God this week, even in something small?' },
  { key: 'C', label: 'C · Tell the group', text: 'Something from this week you’d tell the group on Tuesday.' },
];
