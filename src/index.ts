import Fastify, { FastifyInstance } from 'fastify'
import subscribeValidation from './utils/subscribeValidation';
import { SubscribeData } from './types';
import subscribeUser from './utils/subscribeUser';
import { CONFIG } from './config';
import ThrowErrorCode from './utils/throwErrorCode';
import activateSubscription from './utils/activateSubscription';
import startScanner from './utils/scanner';
import { sendNotificationEmail } from './utils/sendEmail';

const server: FastifyInstance = Fastify({})

server.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
  try {
    const parsed = JSON.parse(body as string);
    done(null, parsed);
  } catch (err) {
    done(null, body);
  }
});

server.post('/subscribe', async (request, reply) => {
  try {
    const body = request.body as string;
    const url = new URLSearchParams(body);
    const data: { [K in keyof SubscribeData]: SubscribeData[K] | null } = {
      email: url.get('email'),
      repo: url.get('repo')
    }
    const validationResult = subscribeValidation(data);
    if (!validationResult.valid) {
      reply.code(400).send({ message: validationResult.message });
      return;
    }

    await subscribeUser(data as SubscribeData);

    return reply.code(200).send('Subscription successful. Confirmation email sent');
  } catch (err) {
    if (err instanceof ThrowErrorCode) {
      return reply.code(err.code).send({ message: err.message });
    }
    console.log(err);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
});

server.get('/confirm/:token', async (request, reply) => {
  try {
    console.log('Confirm endpoint hit with token:', request.params);
    const { token } = request.params as { token?: string };
    if (token) {
      await activateSubscription(token);
    } else {
      throw new ThrowErrorCode(400, 'Token is required');
    }
    return reply.code(200).send('Subscription confirmed successfully');
  } catch (err) {
    if (err instanceof ThrowErrorCode) {
      return reply.code(err.code).send({ message: err.message });
    }
    console.error('Error in confirm endpoint:', err);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
})

const start = async () => {
  try {
    await server.listen({ port: CONFIG.PORT })
    console.log(`Server is running at port :${CONFIG.PORT}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
startScanner();