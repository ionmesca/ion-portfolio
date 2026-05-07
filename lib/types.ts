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

export type ProjectImage =
  | {
      type: "stage";
      alt?: string;
      caption?: string;
      motion?: "active" | "frozen";
      aspect?: string;
    }
  | {
      src: string;
      avif?: string;
      webp?: string;
      alt: string;
      caption?: string;
      type?: "image";
      aspect?: string;
    }
  | {
      type: "video";
      src: string;
      webm?: string;
      poster?: string;
      alt: string;
      caption?: string;
      aspect?: string;
    }
  | {
      type: "comparison";
      alt: string;
      caption?: string;
      defaultView?: "before" | "after";
      before: {
        src: string;
        avif?: string;
        webp?: string;
        alt: string;
        label: string;
      };
      after: {
        src: string;
        avif?: string;
        webp?: string;
        alt: string;
        label: string;
      };
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
  heroVideo?: {
    src: string;
    webm?: string;
    poster?: string;
    alt: string;
  };
  stats: [Stat, Stat, Stat];
  theBet: string;
  role: ProjectRole;
  collaborators: Collaborator[];
  stack: string[];
  images: ProjectImage[];
  order: number;
  published?: boolean;
};
