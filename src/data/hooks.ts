import { useQuery } from '@tanstack/react-query';
import { repo } from './repo';

export const useWeek = () => useQuery({ queryKey: ['week'], queryFn: repo.getWeek });
export const useAnswers = () => useQuery({ queryKey: ['answers'], queryFn: repo.getAnswers });
export const usePresence = () => useQuery({ queryKey: ['presence'], queryFn: repo.getPresence });
export const usePost = (id: string) => useQuery({ queryKey: ['post', id], queryFn: () => repo.getPost(id) });
export const usePrayers = () => useQuery({ queryKey: ['prayers'], queryFn: repo.getPrayers });
export const useVerses = () => useQuery({ queryKey: ['verses'], queryFn: repo.getVerses });
