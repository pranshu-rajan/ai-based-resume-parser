const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export function getCustomApiKey() {
  return localStorage.getItem("groq_api_key") || "";
}

export function setCustomApiKey(key) {
  if (key) {
    localStorage.setItem("groq_api_key", key);
  } else {
    localStorage.removeItem("groq_api_key");
  }
}

function getHeaders() {
  const headers = {};
  const key = getCustomApiKey();
  if (key) {
    headers["X-Groq-API-Key"] = key;
  }
  return headers;
}

export async function fetchServerHealth() {
  try {
    const rootUrl = API_BASE.replace(/\/api\/v1\/?$/, "");
    const res = await fetch(`${rootUrl}/health`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchJobTemplates() {
  const res = await fetch(`${API_BASE}/jobs/templates`);
  if (!res.ok) throw new Error("Failed to fetch job templates");
  return res.json();
}

export async function parseJobDescription(raw_text, title = "") {
  const res = await fetch(`${API_BASE}/jobs/parse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getHeaders()
    },
    body: JSON.stringify({ raw_text, title })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to parse job description");
  }
  return res.json();
}

export async function fetchSampleResumes() {
  const res = await fetch(`${API_BASE}/parser/samples`);
  if (!res.ok) throw new Error("Failed to fetch sample resumes");
  return res.json();
}

export async function parseResumeFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/parser/parse-file`, {
    method: "POST",
    headers: getHeaders(),
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to parse resume file");
  }
  return res.json();
}

export async function evaluateBatchSamples(job, sampleFilenames, rubric) {
  const res = await fetch(`${API_BASE}/match/batch-evaluate-samples`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getHeaders()
    },
    body: JSON.stringify({
      job,
      sample_filenames: sampleFilenames,
      rubric
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to evaluate sample resumes");
  }
  return res.json();
}

export async function evaluateBatchFiles(files, job, rubric) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append("files", file);
  });
  formData.append("job_json", JSON.stringify(job));
  if (rubric) {
    formData.append("rubric_json", JSON.stringify(rubric));
  }

  const res = await fetch(`${API_BASE}/match/batch-evaluate-files`, {
    method: "POST",
    headers: getHeaders(),
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to batch evaluate uploaded files");
  }
  return res.json();
}

export async function optimizeResumeATS(resume, job) {
  const res = await fetch(`${API_BASE}/ats/optimize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getHeaders()
    },
    body: JSON.stringify({ resume, job })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to run ATS optimizer");
  }
  return res.json();
}
