import { prisma } from "../lib/prisma";

const getAllUserSubscription = async (email: string) => {
  const userSubscription = await prisma.subscription.findMany({
    where: {
      user: {
        email,
      }
    },
    select: {
      repoFullName: true,
      isActivated: true,
      lastSeenTag: true,
    }
  })

  return userSubscription.map((subscription) => ({
    email: email,
    repo: subscription.repoFullName,
    isActivated: subscription.isActivated,
    last_seen_tag: subscription.lastSeenTag,
  }));
}

export default getAllUserSubscription;