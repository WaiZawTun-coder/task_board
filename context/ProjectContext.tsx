"use client";

import ProjectType from "@/lib/types/project";
import { createContext, useContext, useState } from "react";

type ProjectContextType = {
  projects: ProjectType[];
  createProject: ({
    title,
    description,
    color_hex,
  }: {
    title: string;
    description?: string;
    color_hex: string;
  }) => Promise<{ success: boolean; message?: string }>;
  updateProject: ({
    project_id,
    title,
    slug,
    description,
    status,
    color_hex,
  }: {
    project_id: number;
    title?: string;
    slug?: string;
    description?: string;
    status: "active" | "archived" | "completed";
    color_hex?: string;
  }) => Promise<{ success: boolean }>;
  deleteProject: ({
    project_id,
  }: {
    project_id: number;
  }) => Promise<{ success: boolean }>;
};

const ProjectContext = createContext<ProjectContextType | null>(null);

export const useProject = () =>
  useContext(ProjectContext) as ProjectContextType;

export const ProjectProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [projects, setProjects] = useState<ProjectType[]>([]);

  const createProject = async ({
    title,
    description,
    color_hex,
  }: {
    title: string;
    description?: string;
    color_hex: string;
  }): Promise<{ success: boolean; message?: string }> => {
    console.log({ title, description, color_hex });
    return { success: false, message: "Still need to add actions" };
  };

  const updateProject = async ({
    project_id,
    title,
    slug,
    description,
    status,
    color_hex,
  }: {
    project_id: number;
    title?: string;
    slug?: string;
    description?: string;
    status: "active" | "archived" | "completed";
    color_hex?: string;
  }): Promise<{ success: boolean }> => {
    console.log({
      project_id,
      title,
      slug,
      description,
      status,
      color_hex,
    });
    return { success: false };
  };

  const deleteProject = async ({
    project_id,
  }: {
    project_id: number;
  }): Promise<{ success: boolean }> => {
    console.log({ project_id });
    return { success: false };
  };

  return (
    <ProjectContext.Provider
      value={{ projects, createProject, updateProject, deleteProject }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
