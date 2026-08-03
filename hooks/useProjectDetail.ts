"use client";

import { useApi } from "@/utilities/api";
import { useCallback, useState } from "react";
import ProjectType, { ProjectStats } from "@/lib/types/project";

export type ProjectDetail = ProjectType & { stats: ProjectStats };

export function useProjectDetail() {
  const fetchApi = useApi();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProject = useCallback(
    async (projectId: number) => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const data: { success: boolean; data?: ProjectDetail } = await fetchApi(
          `/api/protected/project?project_id=${projectId}`,
        );

        if (!data.success || !data.data) {
          setNotFound(true);
          return;
        }

        setProject(data.data);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : (err as { error?: string })?.error || "Unable to load project";

        if (message.toLowerCase().includes("not found")) {
          setNotFound(true);
        } else {
          setError(message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [fetchApi],
  );

  return { project, isLoading, notFound, error, loadProject };
}
