import moment from "moment";
import { ghGetRepoReleasesInfo } from "../api";
import { CONFIG } from "../config";
import { prisma } from "../lib/prisma";
import ThrowErrorCode from "./throwErrorCode";
import { sendNotificationEmail } from "./sendEmail";

const fillScannerQueue = async () => {
  const repos = await prisma.subscription.findMany({
    where: {
      isActivated: true,
    },
    distinct: ['repoFullName'],
    orderBy: { lastSeenTag: 'asc' },
    select: {
      repoFullName: true,
    },
  });

  return repos.map((repo) => repo.repoFullName);
}

const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

const handleNotFoundRepo = async (repo: string) => {
  await prisma.subscription.deleteMany({
    where: {
      repoFullName: repo,
    }
  });
}

const handleUpdateLastSeenTag = async (repo: string, lastPushedTag: string | undefined) => {
  const subscribers = await prisma.subscription.findMany({
    where: {
      AND: [
        {
          lastSeenTag: {
            lt: moment().toDate(),
          }
        },
        { repoFullName: repo },
        { isActivated: true }
      ]
    },
    select: {
      user: true,
      repoFullName: true,
      id: true,
      lastPushedTag: true,
      unsubscribeToken: true,
    }
  })

  if (subscribers.length > 0) {
    const chunkedSubscribers = chunkArray<typeof subscribers[number]>(subscribers, CONFIG.EMAIL_SENDING_CHUNK_SIZE);
    for (let i = 0; i < chunkedSubscribers.length; i++) {
      const chunk = chunkedSubscribers[i];
      await Promise.allSettled(chunk.map(async (subscriber) => {
        try {
          const hasNewRelease = lastPushedTag ? !subscriber.lastPushedTag ? true : moment(lastPushedTag).isAfter(subscriber.lastPushedTag) : false;
          if (hasNewRelease) {
            await sendNotificationEmail(subscriber.user.email, repo, subscriber.unsubscribeToken);
          }
          await prisma.subscription.update({
            where: { AND: [{ repoFullName: repo }, { isActivated: true },], id: subscriber.id },
            data: { lastSeenTag: moment().toDate(), ...(hasNewRelease ? { lastPushedTag: moment(lastPushedTag).toDate() } : {}) },
          });
        } catch (err) {
          console.error(`Error sending notification to ${subscriber.user.email} for repo ${repo}:`, err);
        }
      }));
    }
  }
}

const scanner = async () => {
  const scannerQueue = await fillScannerQueue();
  if (scannerQueue) {
    const chunkedQueue = chunkArray<typeof scannerQueue[number]>(scannerQueue, CONFIG.SCANNER_REPOS_CHUNK_SIZE);
    for (let i = 0; i < chunkedQueue.length; i++) {
      const chunk = chunkedQueue[i];
      await Promise.allSettled(chunk.map(async (repo) => {
        try {
          const data = await ghGetRepoReleasesInfo(repo);
          await handleUpdateLastSeenTag(repo, data);

        } catch (err) {
          if (err instanceof ThrowErrorCode) {
            if (err.code === 404) {
              console.warn(`Repository ${repo} not found. delete all subscription on it.`);
              await handleNotFoundRepo(repo);
              return;
            }
            if (err.code === 429) {
              console.warn('GitHub API rate limit exceeded. Continuing in 1h.');
              throw err;
            }
          }
          console.error(`Error checking repo ${repo}:`, err);
        }
      }));
    }
  }
}


const startScanner = () => {
  const execute = async () => {
    console.log('start scanner execution', moment().toISOString());
    try {
      await scanner();
      setTimeout(execute, CONFIG.SCANNER_INTERVAL);
    } catch (err) {
      if (err instanceof ThrowErrorCode) {
        if (err.code === 429) {
          console.warn('GitHub API rate limit exceeded. Continuing in 1h.');
          setTimeout(execute, 1000 * 60 * 60);
          return;
        }
      }
      console.error('Error in scanner:', err);
      setTimeout(execute, CONFIG.SCANNER_INTERVAL);
    }
  }
  execute();
}

export default startScanner;