import { getAllProjects } from "@/lib/projects";
import { Timeline } from "@/components/portfolio/timeline";
import { Sidebar } from "@/components/portfolio/sidebar";
import { ProjectList } from "@/components/portfolio/project-list";
import { HeroCard } from "@/components/portfolio/hero-card";
import { MobileHeader } from "@/components/portfolio/mobile-header";

export default function Home() {
  const projects = getAllProjects();
  const slugs = projects.map((p) => p.slug);

  return (
    <>
      <MobileHeader />
      <Timeline
        slugs={slugs}
        sidebar={
          <Sidebar>
            <ProjectList projects={projects} />
          </Sidebar>
        }
        cards={projects.map((project) => (
          <HeroCard key={project.slug} project={project} />
        ))}
      />
    </>
  );
}
