import client from 'prom-client';

client.collectDefaultMetrics();

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 1, 2, 5]
});

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export const httpRequestsInProgress = new client.Gauge({
  name: 'http_requests_in_progress',
  help: 'Number of in-progress HTTP requests',
  labelNames: ['method', 'route']
});

export const sentSubscribeRequestTotal = new client.Counter({
  name: 'sent_subscribe_request_total',
  help: 'Total number of sent subscribe requests',
});

export const confirmedSubscriptionsTotal = new client.Counter({
  name: 'confirmed_subscriptions_total',
  help: 'Total number of confirmed subscriptions',
});

export const deactivatedSubscriptionsTotal = new client.Counter({
  name: 'deactivated_subscriptions_total',
  help: 'Total number of deactivated subscriptions',
});

export const emailsSentTotal = new client.Counter({
  name: 'email_sent_total',
  help: 'Total number of sent emails',
});

export const githubApiErrorsTotal = new client.Counter({
  name: 'github_api_errors_total',
  help: 'Total number of GitHub API errors',
  labelNames: ['status_code']
});

export const register = client.register;