import { api } from './api.js';

export const challengeUser = async (opponentId) => {
  const response = await api.post('/v1/duel/challenge', { opponentId });
  return response.data.data;
};

export const acceptChallenge = async (duelId) => {
  const response = await api.post('/v1/duel/accept', { duelId });
  return response.data.data;
};

export const getDuel = async (id) => {
  const response = await api.get(`/v1/duel/${id}`);
  return response.data.data;
};

export const triggerPowerup = async (id, powerupType) => {
  const response = await api.post(`/v1/duel/${id}/powerup`, { powerupType });
  return response.data;
};

export const getDuelHistory = async () => {
  const response = await api.get('/v1/duel/history');
  return response.data.data;
};

export const cancelDuel = async (id) => {
  const response = await api.post(`/v1/duel/${id}/cancel`);
  return response.data;
};
