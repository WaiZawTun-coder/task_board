"use client";

import { queryKeys } from "@/lib/query-keys";
import { ProjectDetail } from "@/lib/types/project";
import { useApi } from "@/utilities/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type ProjectQueryParams = {
  projectId?: number;
};

// type Pagination = {
//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;
// };

type ProjectQueryResponse = {
  success: boolean;
  data: ProjectDetail;
  //   pagination: Pagination;
};

// const DEFAULT_PAGINATION: Pagination = {
//   page: 1,
//   limit: 10,
//   total: 0,
//   totalPages: 1,
// };

const buildQueryString = (params: ProjectQueryParams) => {
  const query = new URLSearchParams();

  if (params.projectId) query.set("project_id", String(params.projectId));

  return query;
};

export function useProjectQuery(params: ProjectQueryParams) {
  const fetchApi = useApi();

  const query = useQuery({
    queryKey: queryKeys.project(params.projectId as number),
    queryFn: async () =>
      (
        await fetchApi<ProjectQueryResponse>(
          `/api/protected/project?${buildQueryString(params)}`,
        )
      ).data,
    enabled: true,
    placeholderData: keepPreviousData,
  });

  return {
    project: query.data ?? null,
    notFound: query.data === null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.isError ? "Unable to fetch project" : null,
    refetch: query.refetch,
  };
}
