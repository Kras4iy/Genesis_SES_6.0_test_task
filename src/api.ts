import { CONFIG } from "./config";
import { githubApiErrorsTotal } from "./promMetrics";
import { getRepoLastRelease } from "./utils/getRepoLastRelease";
import ThrowErrorCode from "./utils/throwErrorCode";

export const ghGetRepoReleasesInfo = async (repo: string): Promise<string | undefined> => {
  try {
    const headers = new Headers();
    if (CONFIG.GHP_TOKEN) {
      headers.append('Authorization', `token ${CONFIG.GHP_TOKEN}`);
    }
    const response = await fetch(`https://api.github.com/repos/${repo}/releases`, { headers });
    const data = await response.json();
    if (!response.ok) {
      githubApiErrorsTotal.labels(String(response.status)).inc();
      if (data.message === 'Not Found' && response.status === 404) {
        throw new ThrowErrorCode(404, `Repository ${repo} not found`);
      }
      if (data.message.includes('API rate limit exceeded') && response.status === 403) {
        throw new ThrowErrorCode(429,`GitHub API rate limit exceeded. Please try again later.`);
      }
      throw new Error(`GitHub API error: ${response.statusText}, data: ${JSON.stringify(data)}`);
    }
    return getRepoLastRelease(data);
  } catch (error) {
    console.error('Error fetching repository information:', error);
    throw error;
  }
}