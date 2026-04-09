import path from 'node:path';
import { expect, test } from 'vitest';
import fs from 'fs';

const getTemplate = (templateName: string): Set<string> => {
  const templatePath = path.join(__dirname, '..', 'emailTemplates', `${templateName}.html`);
  let template = fs.readFileSync(templatePath, 'utf-8');
  const usedPaths = new Set<string>();
  template.replace(/\[\[\s*([a-zA-Z0-9_.-]+)\s*\]\]/g, (_, path) => {
    usedPaths.add(path);
    return path;
  });

  return usedPaths;
}

test('activateSubscription template should have correct placeholders', () => {
  const placeholders = getTemplate('activateSubscription');
  expect(placeholders.has('repo.name')).toBe(true);
  expect(placeholders.has('activation.link')).toBe(true);
  expect(placeholders.has('repo.link')).toBe(true);
})

test('newRelease template should have correct placeholders', () => {
  const placeholders = getTemplate('newRelease');
  expect(placeholders.has('repo.name')).toBe(true);
  expect(placeholders.has('unsubscribe.link')).toBe(true);
  expect(placeholders.has('repo.link')).toBe(true);
})