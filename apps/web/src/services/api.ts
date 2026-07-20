const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('nexus_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async (method: string, path: string, body?: unknown, retries = 3): Promise<any> => {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      if (res.status === 502 || res.status === 503 || res.status === 504) {
        if (attempt < retries) {
          attempt++;
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }
        throw new Error('Server is starting up (Render free instance cold-start). Please wait a moment and try again.');
      }

      if (!res.ok) {
        let errMsg = `${method} ${path} failed: ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson.error) errMsg = errJson.error;
        } catch {}
        throw new Error(errMsg);
      }

      return res.json();
    } catch (err: any) {
      if (attempt < retries && (err.name === 'TypeError' || err.message?.includes('fetch'))) {
        attempt++;
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }
      if (err.name === 'TypeError' || err.message?.includes('fetch')) {
        throw new Error('Server is waking up from hibernation (Render cold start). Please click Enter Workspace again in 5-10 seconds.');
      }
      throw err;
    }
  }
};

export const api = {
  auth: {
    register: (email: string, password: string, fullName: string) =>
      request('POST', '/auth/register', { email, password, fullName }),
    login: (accessKey: string) =>
      request('POST', '/auth/login', { accessKey }),
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
    complete: (courseId: string) =>
      request('POST', `/courses/${courseId}/complete`, {}),
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
