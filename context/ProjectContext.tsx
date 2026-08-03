"use client";

import ProjectType from "@/lib/types/project";
import { useApi } from "@/utilities/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

type ProjectContextType = {
  projects: ProjectType[];
  isProjectsLoading: boolean;
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
  }) => Promise<{ success: boolean; message?: string }>;
  deleteProject: ({
    project_id,
  }: {
    project_id: number;
  }) => Promise<{ success: boolean; message?: string }>;
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
  const [isProjectsLoading, setIsProjectLoading] = useState<boolean>(false);

  const getProjects = useCallback(async () => {
    try {
      setIsProjectLoading(true);
      const data: {
        success: boolean;
        data: ProjectType[];
        message?: string;
        error?: string;
      } = await fetchApi("/api/protected/projects");

      if (!data.success) {
        throw new Error(
          data.message || data.error || "Unexpected error occured",
        );
      }

      setProjects(data.data);
    } catch (err: unknown) {
      throw err;
    } finally {
      setIsProjectLoading(false);
    }
  }, [fetchApi]);

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

      const data: { success: boolean; data: ProjectType } = await fetchApi(
        "/api/protected/project",
        { method: "POST", body },
      );

      if (!data.data?.project_id) {
        throw new Error("Invalid project_id returned");
      }

      setProjects((prev) => [...prev, data.data]);

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

      const data: { success: boolean; message?: string } = await fetchApi(
        `/api/protected/project`,
        {
          method: "PUT",
          body,
        },
      );

      if (data.success) {
        setProjects((prev) =>
          prev.map((project) =>
            project.project_id === project_id
              ? {
                  ...project,
                  title: title ?? project.title,
                  slug: slug ?? project.slug,
                  description: description ?? project.description,
                  status: status ?? project.status,
                  color_hex: color_hex ?? project.color_hex,
                }
              : project,
          ),
        );
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
  }): Promise<{ success: boolean; message?: string }> => {
    if (authLoading || !user?.user_id) {
      return { success: false, message: "No logged in user detected" };
    }

    try {
      const data: { success: boolean; message?: string } = await fetchApi(
        "/api/protected/project",
        { method: "DELETE", body: { project_id } },
      );

      if (data.success) {
        setProjects((prev) =>
          prev.filter((project) => project.project_id !== project_id),
        );
      }

      return data;
    } catch (err: unknown) {
      throw err;
    }
  };

  useEffect(() => {
    if (authLoading || !user?.user_id) return;

    void getProjects();
  }, [authLoading, getProjects, user?.user_id]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        createProject,
        updateProject,
        deleteProject,
        isProjectsLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
