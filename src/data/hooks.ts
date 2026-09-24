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
