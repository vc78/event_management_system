import axiosInstance from './axiosInstance.js';

export const getPolls = (eventId) => axiosInstance.get(`/engagement/polls/${eventId}`).then(r => r.data);
export const createPoll = (payload) => axiosInstance.post('/engagement/polls', payload).then(r => r.data);
export const submitPollResponse = (payload) => axiosInstance.post('/engagement/polls/submit', payload).then(r => r.data);
export const closePoll = (pollId) => axiosInstance.put(`/engagement/polls/close/${pollId}`).then(r => r.data);
export const getPollResults = (pollId) => axiosInstance.get(`/engagement/polls/results/${pollId}`).then(r => r.data);

export const getQnas = (eventId) => axiosInstance.get(`/engagement/qnas/${eventId}`).then(r => r.data);
export const createQna = (payload) => axiosInstance.post('/engagement/qnas', payload).then(r => r.data);
export const upvoteQna = (qnaId) => axiosInstance.put(`/engagement/qnas/upvote/${qnaId}`).then(r => r.data);
export const answerQna = (qnaId) => axiosInstance.put(`/engagement/qnas/answer/${qnaId}`).then(r => r.data);
export const pinQna = (qnaId) => axiosInstance.put(`/engagement/qnas/pin/${qnaId}`).then(r => r.data);
export const deleteQna = (qnaId) => axiosInstance.delete(`/engagement/qnas/${qnaId}`).then(r => r.data);

export const getWordCloud = (eventId) => axiosInstance.get(`/engagement/words/${eventId}`).then(r => r.data);
export const submitWord = (payload) => axiosInstance.post('/engagement/words', payload).then(r => r.data);
