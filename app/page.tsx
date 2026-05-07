import { getAllProjects } from "@/lib/projects";
import { Timeline } from "@/components/portfolio/timeline";
import { ProjectList } from "@/components/portfolio/project-list";
import { HeroCard } from "@/components/portfolio/hero-card";
import { MobileHeader } from "@/components/portfolio/mobile-header";
import { MobileHome } from "@/components/portfolio/mobile-home";
import { NavBar } from "@/components/portfolio/nav-bar";

export default function Home() {
  const projects = getAllProjects();

  return (
    <>
      <MobileHeader />
      <MobileHome projects={projects} />
      <NavBar />
      <div
        id="work"
        className="hidden md:block md:flex-1 md:min-h-0 md:mx-4 md:mb-4 md:bg-bg-base md:rounded-3xl md:shadow-card md:ring-1 md:ring-black/[0.06] md:overflow-hidden"
      >
        <Timeline
          projects={projects}
          sidebar={<ProjectList projects={projects} />}
          cards={projects.map((project, index) => (
            <HeroCard
              key={project.slug}
              project={project}
              stageMotion={index === 0 ? "active" : "frozen"}
            />
          ))}
        />
      </div>
    </>
  );
}
