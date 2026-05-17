"use client";

import ProjectDetailView from "@/components/projects/ProjectDetailView";

export default function ProjectDetails({ params }: { params: { id: string } }) {
  return <ProjectDetailView projectId={params.id} />;
}
