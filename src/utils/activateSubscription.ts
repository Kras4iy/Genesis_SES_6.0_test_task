import moment from "moment";
import { prisma } from "../lib/prisma";
import ThrowErrorCode from "./throwErrorCode";
import { sendSuccessActivationEmail } from "./sendEmail";

const activateSubscription = async (token: string) => {
  const activationToken = await prisma.activationTokens.findUnique({
    where: { token },
  });

  if (!activationToken) {
    throw new ThrowErrorCode(404, 'Token not found');
  }

  if (moment(activationToken.ttl).isBefore(moment()) && !activationToken.isExpired) {
    await prisma.activationTokens.update({
      where: { id: activationToken.id },
      data: {
        isExpired: true,
      }
    });
    throw new ThrowErrorCode(400, 'Token Expired');
  }

  if (activationToken.isExpired) {
    throw new ThrowErrorCode(400, 'Token Expired');
  }

  const subscription = await prisma.subscription.update({
    where: { id: activationToken.subscriptionId },
    data: {
      isActivated: true,
    },
    select: {
      user: {
        select: {
          email: true,
        }
      },
      repoFullName: true,
      unsubscribeToken: true,
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

  await sendSuccessActivationEmail(subscription.user.email, subscription.repoFullName, subscription.unsubscribeToken);
}

export default activateSubscription;