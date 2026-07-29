// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : components/results/HeroSummaryCard.tsx
// =====================================================

interface TypeContentBody {
  overview?: string;
  coreCharacteristics?: string;
  strengths?: string;
  weaknesses?: string;
  decisionStyle?: string;
  growthStrategy?: string;
  [key: string]: string | undefined;
}

interface AuthorityContentBody {
  decisionProcess?: string;
  [key: string]: string | undefined;
}

interface ProfileContentBody {
  character?: string;
  lifePurpose?: string;
  [key: string]: string | undefined;
}

interface HeroSummaryCardProps {
  name: string;
  typeLabel: string;
  authorityLabel: string;
  profile: string;
  signature: string;
  notSelf: string;
  typeContent: TypeContentBody | null;
  authorityContent: AuthorityContentBody | null;
  profileContent: ProfileContentBody | null;
}

const cardStyle: React.CSSProperties = {
  position: 'relative',
  borderRadius: 20,
  padding: '28px 22px',
  background: 'linear-gradient(160deg, rgba(245,166,35,0.14) 0%, rgba(21,21,21,0.9) 55%)',
  border: '1px solid rgba(245,166,35,0.25)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
  backdropFilter: 'blur(10px)',
  overflow: 'hidden',
};

const avatarStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #f5a623, #ff7a45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 22,
  fontWeight: 700,
  color: '#000',
  flexShrink: 0,
};

const badgeRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 16,
};

const badgeStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#eee',
};

const badgeLabelStyle: React.CSSProperties = {
  color: '#888',
  fontWeight: 400,
  marginRight: 4,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: '#f5a623',
  fontWeight: 700,
  marginTop: 22,
  marginBottom: 8,
};

const bodyTextStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: '#d5d5d5',
};

const disclaimerStyle: React.CSSProperties = {
  marginTop: 20,
  padding: '10px 12px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.04)',
  fontSize: 11,
  color: '#888',
  lineHeight: 1.5,
};

function buildExecutiveSummary(
  name: string,
  typeLabel: string,
  authorityLabel: string,
  typeContent: TypeContentBody | null,
  authorityContent: AuthorityContentBody | null,
  profileContent: ProfileContentBody | null
): string {
  const parts: string[] = [];

  parts.push(
    `${name} memiliki energi ${typeLabel} dengan otoritas pengambilan keputusan ${authorityLabel}.`
  );

  if (typeContent?.overview) {
    parts.push(typeContent.overview);
  }

  if (authorityContent?.decisionProcess) {
    parts.push(authorityContent.decisionProcess);
  }

  if (typeContent?.strengths) {
    parts.push(`Kekuatan utama: ${typeContent.strengths}`);
  }

  if (profileContent?.character) {
    parts.push(profileContent.character);
  }

  if (typeContent?.growthStrategy) {
    parts.push(`Fokus pengembangan: ${typeContent.growthStrategy}`);
  }

  const combined = parts.join(' ');
  const words = combined.split(/\s+/);
  return words.length > 300 ? words.slice(0, 300).join(' ') + '...' : combined;
}

export default function HeroSummaryCard({
  name,
  typeLabel,
  authorityLabel,
  profile,
  signature,
  notSelf,
  typeContent,
  authorityContent,
  profileContent,
}: HeroSummaryCardProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const executiveSummary = buildExecutiveSummary(
    name,
    typeLabel,
    authorityLabel,
    typeContent,
    authorityContent,
    profileContent
  );

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={avatarStyle}>{initials || '?'}</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>Human Design Profile</div>
        </div>
      </div>

      <div style={badgeRowStyle}>
        <span style={badgeStyle}><span style={badgeLabelStyle}>Type</span>{typeLabel}</span>
        <span style={badgeStyle}><span style={badgeLabelStyle}>Authority</span>{authorityLabel}</span>
        <span style={badgeStyle}><span style={badgeLabelStyle}>Profile</span>{profile}</span>
        <span style={badgeStyle}><span style={badgeLabelStyle}>Signature</span>{signature}</span>
        <span style={badgeStyle}><span style={badgeLabelStyle}>Not-Self</span>{notSelf}</span>
      </div>

      <div style={sectionTitleStyle}>Executive Summary — AI Insight</div>
      <p style={bodyTextStyle}>{executiveSummary}</p>

      <div style={disclaimerStyle}>
        Interpretasi di halaman ini dihasilkan dengan bantuan AI berdasarkan sistem Human Design,
        dan dimaksudkan sebagai alat bantu refleksi diri — bukan fakta ilmiah, diagnosis, atau
        nasihat medis/psikologis profesional.
      </div>
    </div>
  );
    }
