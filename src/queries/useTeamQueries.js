// src/queries/useTeamQueries.js
// React Query hooks для команд

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryClient';
import teamService from '../services/team.service';

/**
 * Получить все команды
 */
export function useTeams(options = {}) {
  return useQuery({
    queryKey: queryKeys.teams.list(),
    queryFn: () => teamService.getTeams(),
    staleTime: 10 * 60 * 1000, // 10 минут
    ...options,
  });
}

/**
 * Получить команды пользователя
 */
export function useUserTeams(userId, options = {}) {
  return useQuery({
    queryKey: ['teams', 'user', userId],
    queryFn: () => teamService.getUserTeams(userId),
    enabled: !!userId,
    ...options,
  });
}

/**
 * Получить одну команду
 */
export function useTeam(teamId, options = {}) {
  return useQuery({
    queryKey: queryKeys.teams.detail(teamId),
    queryFn: () => teamService.getTeam(teamId),
    enabled: !!teamId,
    ...options,
  });
}

/**
 * Получить участников команды
 */
export function useTeamMembers(teamId, options = {}) {
  return useQuery({
    queryKey: queryKeys.teams.members(teamId),
    queryFn: () => teamService.getTeamMembers(teamId),
    enabled: !!teamId,
    ...options,
  });
}

/**
 * Создать команду
 */
export function useCreateTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => teamService.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });
}

/**
 * Обновить команду
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teamId, data }) => teamService.updateTeam(teamId, data),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });
}

/**
 * Удалить команду
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (teamId) => teamService.deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });
}

/**
 * Добавить участника
 */
export function useAddTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teamId, userId, role }) => 
      teamService.addMember(teamId, userId, role),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.members(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
    },
  });
}

/**
 * Удалить участника
 */
export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teamId, userId }) => teamService.removeMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.members(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
    },
  });
}
