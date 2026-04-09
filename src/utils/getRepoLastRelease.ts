export const getRepoLastRelease = async (releases: { published_at: string }[]): Promise<string | undefined> => {
  try {
    if (releases.length) {
      const latestRelease = releases.reduce((latest: any, current: any) => {
        return new Date(current.published_at) > new Date(latest.published_at) ? current : latest;
      });
      return latestRelease.published_at;
    }

    return undefined
  } catch (error) {
    console.error('Error fetching repository information:', error);
    throw error;
  }
}