import { prisma } from "../lib/prisma";
import ThrowErrorCode from "./throwErrorCode";

const activateSubscription = async (token: string) => {
  const activationToken = await prisma.activationTokens.findUnique({
    where: { token },
  });

  if (!activationToken) {
    throw new ThrowErrorCode(404, 'Token not found');
  }

  if (activationToken.isExpired) {
    throw new ThrowErrorCode(400, 'Invalid token');
  }

  await prisma.subscription.update({
    where: { id: activationToken.subscriptionId },
    data: {
      isActivated: true,
    }
  });

  await prisma.activationTokens.updateMany({
    data: {
      isExpired: true,
    },
    where: {
      subscriptionId: activationToken.subscriptionId,
    }
  });

  await prisma.activationTokens.update({
    where: { id: activationToken.id },
    data: {
      isActivated: true,
    }
  })
}

export default activateSubscription;