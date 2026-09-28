import { useQuery } from '@tanstack/react-query';
import { repo } from './repo';
import { useAuth } from '../auth/AuthProvider';

export const useWeek = () => useQuery({ queryKey: ['week'], queryFn: repo.getWeek });
export const useAnswers = () => useQuery({ queryKey: ['answers'], queryFn: repo.getAnswers });
export const usePresence = () => useQuery({ queryKey: ['presence'], queryFn: repo.getPresence });
export const usePost = (id: string) => useQuery({ queryKey: ['post', id], queryFn: () => repo.getPost(id) });
export const usePrayers = () => useQuery({ queryKey: ['prayers'], queryFn: repo.getPrayers });
export const useVerses = () => useQuery({ queryKey: ['verses'], queryFn: repo.getVerses });

export function useAnswerState() {
  const { data: w } = useWeek();
  const { member } = useAuth();
  const weekId = w?.id; const memberId = member?.id;
  return useQuery({
    queryKey: ['answerState', weekId, memberId],
    enabled: !!weekId && !!memberId,
    queryFn: () => repo.getAnswerState(weekId, memberId),
  });
}

export const useRsvps = () => {
  const { data: w } = useWeek();
  const { member } = useAuth();
  const weekId = (w as any)?.id;
  return useQuery({ queryKey: ['rsvps', weekId, member?.id], enabled: !!weekId, queryFn: () => repo.getRsvps(weekId, member?.id) });
};
export const useMembers = () => useQuery({ queryKey: ['members'], queryFn: repo.listMembers });

export const useSchedule = () => useQuery({ queryKey: ['schedule'], queryFn: repo.getSchedule });
export const useEvent = (id: string) => useQuery({ queryKey: ['event', id], queryFn: () => repo.getEvent(id) });

export const usePartnership = () => {
  const { member } = useAuth();
  return useQuery({ queryKey: ['partnership', member?.id], enabled: !!member?.id, queryFn: () => repo.getPartnership(member?.id) });
};
