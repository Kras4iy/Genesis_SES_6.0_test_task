import { prisma } from "../lib/prisma";
import ThrowErrorCode from "./throwErrorCode";

const deactivateSubscription = async (token: string) => {
  await prisma.subscription.delete({
    where: {
      unsubscribeToken: token,
    },
  }).catch(err => {
    if (err.code === "P2025") {
      throw new ThrowErrorCode(404, 'Token not found');
    }
  });
}

export default deactivateSubscription;