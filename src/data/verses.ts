// Verse finder content. A curated map of feelings/topics to REAL passages,
// quoted from the World English Bible (public domain). The app only surfaces
// these — it never writes or paraphrases Scripture. Leaders can extend this list.
export type Verse = { ref: string; text: string };
export type Topic = { id: string; label: string; keywords: string[]; verses: Verse[] };
export const source = 'World English Bible';

export const topics: Topic[] = [
  { id: 'anxiety', label: 'Anxious', keywords: ['anxious', 'anxiety', 'worry', 'worried', 'stress', 'stressed', 'overthink', 'panic'], verses: [
    { ref: 'Philippians 4:6–7', text: 'In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus.' },
    { ref: '1 Peter 5:7', text: 'casting all your worries on him, because he cares for you.' },
    { ref: 'Matthew 6:34', text: 'Therefore don’t be anxious for tomorrow, for tomorrow will be anxious for itself. Each day’s own evil is sufficient.' },
  ]},
  { id: 'anger', label: 'Angry', keywords: ['angry', 'anger', 'mad', 'resent', 'resentful', 'bitter', 'furious', 'irritated'], verses: [
    { ref: 'Ephesians 4:26–27', text: '“Be angry, and don’t sin.” Don’t let the sun go down on your wrath, and don’t give place to the devil.' },
    { ref: 'James 1:19–20', text: 'Let every man be swift to hear, slow to speak, and slow to anger; for the anger of man doesn’t produce the righteousness of God.' },
    { ref: 'Proverbs 15:1', text: 'A gentle answer turns away wrath, but a harsh word stirs up anger.' },
  ]},
  { id: 'grief', label: 'Grieving', keywords: ['grief', 'grieving', 'loss', 'lost', 'mourning', 'mourn', 'sad', 'sorrow', 'died', 'death', 'heartbroken'], verses: [
    { ref: 'Psalm 34:18', text: 'Yahweh is near to those who have a broken heart, and saves those who have a crushed spirit.' },
    { ref: 'Matthew 5:4', text: 'Blessed are those who mourn, for they shall be comforted.' },
    { ref: 'Revelation 21:4', text: 'He will wipe away every tear from their eyes. Death will be no more; neither will there be mourning, nor crying, nor pain any more. The first things have passed away.' },
  ]},
  { id: 'fear', label: 'Afraid', keywords: ['afraid', 'fear', 'fearful', 'scared', 'terrified', 'dread'], verses: [
    { ref: 'Isaiah 41:10', text: 'Don’t be afraid, for I am with you. Don’t be dismayed, for I am your God. I will strengthen you. Yes, I will help you. Yes, I will uphold you with the right hand of my righteousness.' },
    { ref: 'Psalm 56:3', text: 'When I am afraid, I will put my trust in you.' },
    { ref: '2 Timothy 1:7', text: 'For God didn’t give us a spirit of fear, but of power, love, and self-control.' },
  ]},
  { id: 'weary', label: 'Weary', keywords: ['weary', 'tired', 'exhausted', 'burned out', 'burnout', 'overwhelmed', 'worn out', 'drained'], verses: [
    { ref: 'Matthew 11:28–30', text: 'Come to me, all you who labor and are heavily burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart; and you will find rest for your souls. For my yoke is easy, and my burden is light.' },
    { ref: 'Isaiah 40:31', text: 'But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint.' },
    { ref: 'Psalm 23:1–3', text: 'Yahweh is my shepherd; I shall lack nothing. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul.' },
  ]},
  { id: 'grateful', label: 'Grateful', keywords: ['grateful', 'gratitude', 'thankful', 'thanks', 'blessed', 'blessing'], verses: [
    { ref: '1 Thessalonians 5:16–18', text: 'Rejoice always. Pray without ceasing. In everything give thanks, for this is the will of God in Christ Jesus toward you.' },
    { ref: 'Psalm 100:4', text: 'Enter into his gates with thanksgiving, and into his courts with praise. Give thanks to him, and bless his name.' },
    { ref: 'Colossians 3:15', text: 'Let the peace of God rule in your hearts, to which also you were called in one body, and be thankful.' },
  ]},
  { id: 'lonely', label: 'Lonely', keywords: ['lonely', 'alone', 'isolated', 'isolation', 'nobody', 'left out'], verses: [
    { ref: 'Deuteronomy 31:6', text: 'Be strong and courageous. Don’t be afraid or scared of them; for Yahweh your God himself is who goes with you. He will not fail you nor forsake you.' },
    { ref: 'Psalm 68:6', text: 'God sets the lonely in families. He brings out the prisoners with singing.' },
    { ref: 'Hebrews 13:5', text: 'Be free from the love of money, content with such things as you have, for he has said, “I will in no way leave you, neither will I in any way forsake you.”' },
  ]},
  { id: 'temptation', label: 'Tempted', keywords: ['tempted', 'temptation', 'struggling', 'struggle', 'sin', 'addiction', 'can’t stop'], verses: [
    { ref: '1 Corinthians 10:13', text: 'No temptation has taken you except what is common to man. God is faithful, who will not allow you to be tempted above what you are able, but will with the temptation also make the way of escape, that you may be able to endure it.' },
    { ref: 'Hebrews 4:15–16', text: 'For we don’t have a high priest who can’t be touched with the feeling of our infirmities, but one who has been in all points tempted like we are, yet without sin. Let’s therefore draw near with boldness to the throne of grace, that we may receive mercy, and may find grace for help in time of need.' },
    { ref: 'James 4:7', text: 'Be subject therefore to God. Resist the devil, and he will flee from you.' },
  ]},
  { id: 'doubt', label: 'Doubting', keywords: ['doubt', 'doubting', 'unsure', 'questioning', 'unbelief', 'faith is weak'], verses: [
    { ref: 'Mark 9:24', text: 'Immediately the father of the child cried out with tears, “I believe. Help my unbelief!”' },
    { ref: 'John 20:27', text: 'Then he said to Thomas, “Reach here your finger, and see my hands. Reach here your hand, and put it into my side. Don’t be unbelieving, but believing.”' },
    { ref: 'James 1:5–6', text: 'But if any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach, and it will be given to him. But let him ask in faith, without any doubting.' },
  ]},
  { id: 'guidance', label: 'A decision', keywords: ['decision', 'decide', 'guidance', 'direction', 'what should i do', 'wisdom', 'choice', 'unsure what'], verses: [
    { ref: 'Proverbs 3:5–6', text: 'Trust in Yahweh with all your heart, and don’t lean on your own understanding. In all your ways acknowledge him, and he will make your paths straight.' },
    { ref: 'Psalm 119:105', text: 'Your word is a lamp to my feet, and a light for my path.' },
    { ref: 'James 1:5', text: 'But if any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach, and it will be given to him.' },
  ]},
  { id: 'forgive', label: 'Forgiveness', keywords: ['forgive', 'forgiveness', 'wronged', 'hurt me', 'betrayed', 'let go'], verses: [
    { ref: 'Colossians 3:13', text: 'bearing with one another, and forgiving each other, if any man has a complaint against any; even as Christ forgave you, so you also do.' },
    { ref: 'Ephesians 4:32', text: 'And be kind to one another, tender hearted, forgiving each other, just as God also in Christ forgave you.' },
    { ref: 'Matthew 6:14', text: 'For if you forgive men their trespasses, your heavenly Father will also forgive you.' },
  ]},
];

export function searchVerses(query: string): { topic?: Topic; results: Verse[] } {
  const q = query.toLowerCase().trim();
  if (!q) return { results: [] };
  const t = topics.find(t => t.label.toLowerCase() === q)
    || topics.find(t => t.keywords.some(k => q.includes(k)) || q.includes(t.label.toLowerCase()));
  return t ? { topic: t, results: t.verses } : { results: [] };
}
