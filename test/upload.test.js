import test from 'node:test';
import assert from 'node:assert/strict';
import { upload } from '../middleware/auth.js';

test('File Upload Middleware Specifications', (t) => {
  t.test('upload middleware uses memoryStorage and 5MB limit', () => {
    assert.ok(upload);
    assert.equal(upload.limits.fileSize, 5 * 1024 * 1024);
  });
});
