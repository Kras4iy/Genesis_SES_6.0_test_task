import { prisma } from "../lib/prisma";

export const confirmToken = async (token: string) => {
  try {
    //TODO: rewrite to unique token
    let subscription = await prisma.subscription.findFirst({
      where: { activationToken: token },
    });

    if (!subscription) {
      throw new Error('Invalid token');
    }

    subscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { isActivated: true },
    });

    return subscription;
  } catch (err) {
    console.error('Error confirming token:', err);
    throw new Error('Failed to confirm token');
  }
}