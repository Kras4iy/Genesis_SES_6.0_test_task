import { prisma } from '../lib/prisma';
import { sendActivationEmail } from '../utils/sendEmail';
import { SubscribeData } from '../types';
import crypto from 'crypto';
import ThrowErrorCode from '../utils/throwErrorCode';
import { ghGetRepoReleasesInfo } from '../api';
import moment from 'moment';

export default async function subscribeUser(data: SubscribeData) {
  const lastPushedTime = await ghGetRepoReleasesInfo(data.repo).catch((err) => {
    if (err instanceof ThrowErrorCode && err.code !== 429) {
      throw err;
    } else {
      throw new ThrowErrorCode(500, 'Internal Server Error')
    }
  });

  let existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (!existingUser) {
    existingUser = await prisma.user.create({
      data: {
        email: data.email,
      }
    });
  }

  let subscription = await prisma.subscription.findFirst({
    where: {
      repoFullName: data.repo,
      userId: existingUser.id,
    }
  })

  if (subscription) {
    if (subscription.isActivated) {
      throw new ThrowErrorCode(409, 'Email already subscribed to this repository');
    } else {
      await prisma.activationTokens.updateMany({
        data: {
          isExpired: true,
        },
        where: {
          subscriptionId: subscription.id,
        }
      })
    }
  } else {
    subscription = await prisma.subscription.create({
      data: {
        repoFullName: data.repo,
        userId: existingUser.id,
        lastSeenTag: moment().toDate(),
        lastPushedTag: lastPushedTime ? moment(lastPushedTime).toDate() : undefined,
        unsubscribeToken: crypto.createHash('sha256').update(crypto.randomUUID()).digest('hex'),
      }
    });
  }


  const activationToken = await prisma.activationTokens.create({
    data: {
      token: crypto.createHash('sha256').update(crypto.randomUUID()).digest('hex'),
      subscriptionId: subscription.id,
      ttl: moment().add(2, 'minutes').toDate(),
    }
  });

  await sendActivationEmail(existingUser.email, activationToken.token, data.repo);

  return subscription;
}