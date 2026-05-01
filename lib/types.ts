export type Stat = {
  value: string;
  label: string;
  icon?: "bot";
};

export type ProjectStatus = {
  text: string;
  tone?: "green" | "amber" | "grey";
  pulse?: boolean;
};

export type Collaborator = {
  initials: string;
  color: 1 | 2 | 3 | 4 | 5;
  icon?: string;
  label?: string;
};

export type ProjectRole = {
  title: string;
  description?: string;
};

export type ProjectMeta = {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  tagline: string;
  year: string;
  status: ProjectStatus;
  icon: string;
  iconBg: string;
  hero: string;
  stats: [Stat, Stat, Stat];
  theBet: string;
  role: ProjectRole;
  collaborators: Collaborator[];
  stack: string[];
  images: { src: string; alt: string }[];
  order: number;
  published?: boolean;
};
