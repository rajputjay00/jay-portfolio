import creativefuelRaw from '@/../content/case-studies/creativefuel.md';
import brandSocialRaw from '@/../content/case-studies/brand-social.md';
import strictlyRaw from '@/../content/case-studies/strictly-for-corporate.md';
import campusRaw from '@/../content/case-studies/campus-community.md';

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
    dummy?: boolean;
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

function cleanText(text: string): string {
  return text.replace(/\[DUMMY\]\s*/g, '').trim();
}

function parseMarkdownCaseStudy(raw: string): CaseStudyData {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const frontmatterStr = fmMatch ? fmMatch[1] : '';
  const body = fmMatch ? fmMatch[2] : raw;

  const data: {
    id?: string;
    order?: number;
    title?: string;
    client?: string;
    niche?: string;
    role?: string;
    heroImage?: string;
    headline: {
      value?: string;
      label?: string;
      verified?: boolean;
      dummy?: boolean;
    };
    accounts: Array<{ name: string; followers: string }>;
    brands: string[];
    [key: string]: unknown;
  } = {
    headline: {},
    accounts: [],
    brands: [],
  };

  const lines = frontmatterStr.split(/\r?\n/);
  let currentKey = '';
  let inHeadline = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('headline:')) {
      inHeadline = true;
      currentKey = 'headline';
      continue;
    }

    if (inHeadline) {
      if (line.startsWith('  ') || line.startsWith('\t')) {
        const valMatch = trimmed.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
        if (valMatch) {
          const k = valMatch[1];
          const rawVal = valMatch[2].replace(/^["']|["']$/g, '');
          if (rawVal === 'true') {
            (data.headline as Record<string, unknown>)[k] = true;
          } else if (rawVal === 'false') {
            (data.headline as Record<string, unknown>)[k] = false;
          } else {
            (data.headline as Record<string, unknown>)[k] = rawVal;
          }
        }
        continue;
      } else {
        inHeadline = false;
      }
    }

    if (trimmed.startsWith('accounts:')) {
      currentKey = 'accounts';
      continue;
    }

    if (trimmed.startsWith('brands:')) {
      const match = trimmed.match(/brands:\s*\[(.*)\]/);
      if (match) {
        data.brands = match[1].split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
      }
      continue;
    }

    if (currentKey === 'accounts' && trimmed.startsWith('- {')) {
      const nameMatch = trimmed.match(/name:\s*"([^"]+)"/);
      const folMatch = trimmed.match(/followers:\s*"([^"]+)"/);
      if (nameMatch && folMatch) {
        data.accounts.push({ name: nameMatch[1], followers: folMatch[1] });
      }
      continue;
    }

    const kvMatch = trimmed.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const valStr = kvMatch[2].replace(/^["']|["']$/g, '');
      if (key === 'order') {
        data.order = parseInt(valStr, 10);
      } else {
        data[key] = valStr;
      }
      currentKey = key;
    }
  }

  // Parse markdown body sections
  const sectionBriefMatch = body.match(/## Brief and baseline\r?\n([\s\S]*?)(?=\r?\n## |$)/);
  const sectionInsightMatch = body.match(/## Insight and idea\r?\n([\s\S]*?)(?=\r?\n## |$)/);
  const sectionExecMatch = body.match(/## Execution and distribution\r?\n([\s\S]*?)(?=\r?\n## |$)/);
  const sectionResultsMatch = body.match(/## Results and learning\r?\n([\s\S]*?)(?=\r?\n## |$)/);

  const brief = cleanText(sectionBriefMatch ? sectionBriefMatch[1] : '');
  const insight = cleanText(sectionInsightMatch ? sectionInsightMatch[1] : '');
  const execution = cleanText(sectionExecMatch ? sectionExecMatch[1] : '');
  const results = cleanText(sectionResultsMatch ? sectionResultsMatch[1] : '');

  const summary = brief.split('\n\n')[0] || brief;
  const headlineResult = `${data.headline?.value || ''} ${data.headline?.label || ''}`.trim();

  return {
    id: data.id || '',
    order: data.order || 0,
    title: data.title || '',
    client: data.client || '',
    niche: data.niche || '',
    role: data.role || '',
    kicker: data.niche ? data.niche.toUpperCase() : '',
    headline: {
      value: data.headline?.value || '',
      label: data.headline?.label || '',
      verified: data.headline?.dummy !== true && data.headline?.value !== 'XXK',
      dummy: data.headline?.dummy === true,
    },
    heroImage: data.heroImage || '',
    accounts: data.accounts?.length ? data.accounts : undefined,
    brands: data.brands?.length ? data.brands : undefined,
    summary,
    sections: {
      headlineResult,
      brief,
      insight,
      execution,
      results,
    },
  };
}

export const caseStudiesList: CaseStudyData[] = [
  parseMarkdownCaseStudy(creativefuelRaw),
  parseMarkdownCaseStudy(brandSocialRaw),
  parseMarkdownCaseStudy(strictlyRaw),
  parseMarkdownCaseStudy(campusRaw),
].sort((a, b) => a.order - b.order);
