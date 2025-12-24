// src/queries/index.js
// Экспорт React Query конфигурации и хуков

export { queryClient, queryKeys } from './queryClient';

// Board queries
export {
  useBoards,
  useBoard,
  useBoardColumns,
  useBoardTasks,
  useCreateBoard,
  useUpdateBoard,
  useDeleteBoard,
  useCreateColumn,
  useCreateTask,
  useUpdateTask,
  useMoveTask,
  useDeleteTask,
} from './useBoardQueries';

// Team queries
export {
  useTeams,
  useUserTeams,
  useTeam,
  useTeamMembers,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
  useAddTeamMember,
  useRemoveTeamMember,
} from './useTeamQueries';

// Learning queries
export {
  useCourses,
  useCourse,
  useCourseLessons,
  useUserProgress,
  useUserLearningStats,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  useEnrollCourse,
  useCompleteLesson,
  useSubmitExam,
  useCourseCategories,
} from './useLearningQueries';
