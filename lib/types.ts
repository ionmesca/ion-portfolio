export type ProjectMeta = {
  title: string;
  slug: string;
  description: string;
  year: number;
  icon: string;
  iconBg: string;
  hero: string;
  stats: { value: string; label: string }[];
  role: string;
  collaborators: { name: string; avatar: string }[];
  stack: string[];
  images: { src: string; alt: string }[];
  order: number;
};
