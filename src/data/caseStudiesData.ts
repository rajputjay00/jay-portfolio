export interface CaseStudyData {
  id: string;
  order: number;
  title: string;
  client: string;
  niche: string;
  role: string;
  kicker: string;
  headline: {
    value: string;
    label: string;
    verified?: boolean;
  };
  heroImage: string;
  accounts?: Array<{ name: string; followers: string }>;
  brands?: string[];
  summary: string;
  sections: {
    headlineResult: string;
    brief: string;
    insight: string;
    execution: string;
    results: string;
  };
}

export const caseStudiesList: CaseStudyData[] = [
  {
    id: 'creativefuel',
    order: 1,
    title: 'Creativefuel — Internet-native page portfolio',
    client: 'Creativefuel (freelance)',
    niche: 'Community + Character',
    role: 'Content & Social Media Manager (freelance)',
    kicker: 'COMMUNITY + CHARACTER',
    headline: {
      value: '401K',
      label: 'followers on Indian Corporate Life, one of four pages managed',
      verified: true,
    },
    heroImage: '/media/images/dummy-01.jpg',
    summary: 'Managing high-velocity humor and community Instagram properties across four distinct brand voices.',
    accounts: [
      { name: 'Indian Corporate Life', followers: '401K' },
      { name: 'Relatable Office Memes', followers: '34.3K' },
      { name: 'Corporate Dadi', followers: '4.2K' },
      { name: 'Corporate Nani', followers: '4.9K' },
    ],
    sections: {
      headlineResult: '401K followers on Indian Corporate Life, one of four distinct Instagram properties managed under the Creativefuel umbrella.',
      brief: 'Freelance social-media work managing multiple Instagram identities and content systems for Creativefuel.\n\nManaged multi-account content operations across four humor and community properties, establishing consistent publishing schedules and voice guidelines.',
      insight: 'Corporate humor resonates most when framed as shared survival rather than individual complaints, giving characters like Dadi and Nani distinct authoritative voices.',
      execution: 'Produced daily meme carousels and short-form video concepts tailored for peak commuting and end-of-day engagement windows.',
      results: '• Indian Corporate Life — 401K followers\n• Relatable Office Memes — 34.3K followers\n• Corporate Nani — 4.9K followers\n• Corporate Dadi — 4.2K followers\n\nGenerated over XXM organic impressions across the network, demonstrating that repeatable character framing and swift trend turnaround sustain long-term engagement.',
    },
  },
  {
    id: 'brand-social',
    order: 2,
    title: 'Brand Social — National brands, feed-native',
    client: 'Flipkart, Realme, Lava, Jio Hotstar, Wellbeing Nutrition (via Creativefuel)',
    niche: 'Brand',
    role: 'Social Media Strategist & Campaign Execution',
    kicker: 'BRAND SOCIAL',
    headline: {
      value: '5',
      label: 'national brands made to feel native to the feed',
      verified: true,
    },
    heroImage: '/media/images/dummy-02.jpg',
    summary: 'Social-first commercial integrations and moment-marketing activations designed to blend into organic feeds.',
    brands: ['Flipkart', 'Realme', 'Lava', 'Jio Hotstar', 'Wellbeing Nutrition'],
    sections: {
      headlineResult: '5 national brands made to feel native to the feed through social-first campaign concepts and meme integrations.',
      brief: 'Social-first content and campaign work for major consumer brands through Creativefuel.\n\nDeveloped branded integrations and moment-marketing activations designed to blend seamlessly into fast-scrolling consumer feeds.',
      insight: 'Viewers skip blatant product pitches, so campaigns were structured around relatable micro-dramas where the product serves as the natural punchline.',
      execution: 'Distributed custom video memes and co-branded reels across high-affinity meme pages and creator networks during key commercial drop dates.',
      results: 'Achieved an average engagement rate of XX% with over XXK total interactions across all five brand partner campaigns.',
    },
  },
  {
    id: 'strictly-for-corporate',
    order: 3,
    title: 'Strictly For Corporate — Built from scratch',
    client: 'Own page (independent)',
    niche: 'Creator',
    role: 'Founder and sole operator',
    kicker: 'CREATOR & INDEPENDENT',
    headline: {
      value: '39.5K',
      label: 'followers built on an independent corporate-culture page',
      verified: true,
    },
    heroImage: '/media/images/dummy-03.jpg',
    summary: 'Independent corporate-culture media property built and scaled from zero to 39.5K engaged followers.',
    sections: {
      headlineResult: '39.5K followers built on an independent corporate-culture property from 0 without paid acquisition.',
      brief: 'An independent corporate-culture Instagram property, created and run by Jay.\n\nFounded and scaled an independent Instagram property from zero to 39.5K followers, focusing on workplace culture and corporate satire.',
      insight: 'Identified an untapped niche for clean, relatable corporate commentary that resonated across early-career professionals and managers alike.',
      execution: 'Maintained an agile publishing rhythm of XX reels and carousels per week, optimizing hooks in the first 1.5 seconds for maximum save-and-share velocity.',
      results: '• ~39.5K followers\n\nScaled to XXK monthly reach, confirming that authentic niche storytelling drives compounding audience loyalty.',
    },
  },
  {
    id: 'campus-community',
    order: 4,
    title: 'Campus & Community — TEDxIPSA Indore and GDGOC IPSA',
    client: 'TEDxIPSA Indore, GDGOC IPSA',
    niche: 'Culture',
    role: 'Social Media Lead',
    kicker: 'CULTURE & COMMUNITY',
    headline: {
      value: 'XXK',
      label: 'impressions generated across student community campaigns',
      verified: false,
    },
    heroImage: '/media/images/dummy-04.jpg',
    summary: 'Event promotion and student community engagement turning campus conferences into Instagram-first stories.',
    sections: {
      headlineResult: 'XXK impressions generated across student community campaigns and flagship university event activations.',
      brief: 'Social-media and event communication for TEDxIPSA Indore and GDGOC IPSA, turning campus events, workshops and community activity into Instagram-first content.\n\nSpearheaded social media campaigns and event promotion for major student-led university initiatives, driving awareness and ticket registrations.',
      insight: 'Shifted focus from formal announcements to behind-the-scenes speaker spotlights and interactive countdown stories to build pre-event anticipation.',
      execution: 'Rolled out multi-stage teaser reels, speaker reveal carousels, and live day-of coverage across campus channels.',
      results: 'Drove XX+ attendee registrations and reached over XXK unique accounts across Indore student networks.',
    },
  },
];
