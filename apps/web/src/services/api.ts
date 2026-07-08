const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('nexus_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async (method: string, path: string, body?: unknown) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`);
  return res.json();
};

export const api = {
  auth: {
    register: (email: string, password: string, fullName: string) =>
      request('POST', '/auth/register', { email, password, fullName }),
    login: (email: string, password: string) =>
      request('POST', '/auth/login', { email, password }),
    me: () => request('GET', '/auth/me'),
  },
  courses: {
    list: () => request('GET', '/courses'),
    lessons: (courseId: string) => request('GET', `/courses/${courseId}/lessons`),
    concepts: (lessonId: string) => request('GET', `/courses/lessons/${lessonId}/concepts`),
    quizzes: (lessonId: string) => request('GET', `/courses/lessons/${lessonId}/quizzes`),
    submitQuiz: (quizId: string, score: number) =>
      request('POST', `/courses/quizzes/${quizId}/submit`, { score }),
    completeConcept: (conceptId: string) =>
      request('POST', `/courses/concepts/${conceptId}/complete`, {}),
    mastery: () => request('GET', '/courses/mastery'),
  },
  notes: {
    list: () => request('GET', '/notes'),
    byConcept: (conceptId: string) => request('GET', `/notes/concept/${conceptId}`),
    save: (conceptId: string | null, markdown: string) =>
      request('POST', '/notes', { conceptId, markdown }),
  },
  projects: {
    list: () => request('GET', '/projects'),
    create: (name: string) => request('POST', '/projects', { name }),
    execute: (projectId: string, code: string, language: string) =>
      request('POST', `/projects/${projectId}/execute`, { code, language }),
    executions: (projectId: string) => request('GET', `/projects/${projectId}/executions`),
  },
  chat: {
    send: (persona: string, prompt: string) =>
      request('POST', '/chat', { persona, prompt }),
  },
};
