const BASE_URL = 'http://localhost:8080/api/v1';

async function makeRequest(path, method = 'GET', body = null, token = null, useCookie = false) {
  const headers = {};
  
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    if (useCookie) {
      headers['Cookie'] = `token=${token}`;
    } else {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const options = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const url = `${BASE_URL}${path}`;
  
  try {
    const res = await fetch(url, options);
    let data = null;
    const contentType = res.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    
    return {
      status: res.status,
      ok: res.ok,
      headers: res.headers,
      data
    };
  } catch (error) {
    return {
      status: 500,
      ok: false,
      error: error.message
    };
  }
}

export async function register(email, password, fullName) {
  return makeRequest('/auth/register', 'POST', { email, password, fullName });
}

export async function login(email, password) {
  return makeRequest('/auth/login', 'POST', { email, password });
}

export async function getMe(token, useCookie = false) {
  return makeRequest('/auth/me', 'GET', null, token, useCookie);
}

export async function getCourses(token) {
  return makeRequest('/courses', 'GET', null, token);
}

export async function getLessons(courseId, token) {
  return makeRequest(`/courses/${courseId}/lessons`, 'GET', null, token);
}

export async function getConcepts(lessonId, token) {
  return makeRequest(`/courses/lessons/${lessonId}/concepts`, 'GET', null, token);
}

export async function getQuizzes(lessonId, token) {
  return makeRequest(`/courses/lessons/${lessonId}/quizzes`, 'GET', null, token);
}

export async function submitQuiz(quizId, score, token) {
  return makeRequest(`/courses/quizzes/${quizId}/submit`, 'POST', { score }, token);
}

export async function completeConcept(conceptId, token) {
  return makeRequest(`/courses/concepts/${conceptId}/complete`, 'POST', {}, token);
}

export async function getMastery(token) {
  return makeRequest('/courses/mastery', 'GET', null, token);
}

export async function getNotes(token) {
  return makeRequest('/notes', 'GET', null, token);
}

export async function getNoteByConcept(conceptId, token) {
  return makeRequest(`/notes/concept/${conceptId}`, 'GET', null, token);
}

export async function createNote(conceptId, markdown, token) {
  return makeRequest('/notes', 'POST', { conceptId, markdown }, token);
}

export async function getProjects(token) {
  return makeRequest('/projects', 'GET', null, token);
}

export async function createProject(name, token) {
  return makeRequest('/projects', 'POST', { name }, token);
}

export async function executeProject(projectId, code, language, token) {
  return makeRequest(`/projects/${projectId}/execute`, 'POST', { code, language }, token);
}

export async function chat(persona, prompt, token) {
  return makeRequest('/chat', 'POST', { persona, prompt }, token);
}
