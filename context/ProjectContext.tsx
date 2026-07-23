"use client";

import ProjectType from "@/lib/types/project";
import { useApi } from "@/utilities/api";
import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

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
  const fetchApi = useApi();

  const { authLoading, user } = useAuth();

  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [projectsMap, setProjectsMap] = useState<Map<number, ProjectType>>(
    new Map<number, ProjectType>(),
  );

  const createProject = async ({
    title,
    description,
    color_hex,
  }: {
    title: string;
    description?: string;
    color_hex: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const body = { title, description, color_hex };

      const data: { success: boolean; data: { project_id: number } } =
        await fetchApi("/api/protected/project", { method: "POST", body });

      if (!data.data.project_id) {
        throw new Error("Invalid project_id returned");
      }

      const newProject: { success: boolean; data: ProjectType } =
        await fetchApi(
          `/api/protected/project?project_id=${data.data.project_id}`,
        );

      setProjects((prev) => [...prev, newProject.data]);
      setProjectsMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.data.project_id, newProject.data);

        return newMap;
      });

      return data;
    } catch (err: unknown) {
      throw err;
    }
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
  }): Promise<{ success: boolean; message?: string }> => {
    if (authLoading || !user?.user_id) {
      return { success: false, message: "No logged in user detected" };
    }

    try {
      const body = {
        project_id,
        title,
        slug,
        description,
        status,
        color_hex,
      };

      const data: { success: boolean } = await fetchApi(
        `/api/protected/project`,
        {
          method: "PUT",
          body,
        },
      );

      if (data.success) {
        setProjectsMap((prev) => {
          const newMap = new Map(prev);
          const currentItem = newMap.get(project_id);

          if (currentItem) {
            newMap.set(project_id, {
              project_id,
              title: title || currentItem.title,
              slug: slug || currentItem.slug,
              description: description || currentItem.description,
              status: status || currentItem.status,
              colorHex: color_hex || currentItem.colorHex,
            });
          }

          return newMap;
        });
      }

      return data;
    } catch (err: unknown) {
      throw err;
    }
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
