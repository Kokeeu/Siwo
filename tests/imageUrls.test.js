import test from 'node:test';
import assert from 'node:assert/strict';
import { isExpirableImageUrl, sanitizeCoverImage } from '../src/utils/imageUrls.js';

const SIGNED_B2_URL =
  'https://kitsu-production-media.s3.us-west-002.backblazeb2.com/anime/50032/poster_image/105891126e812c0baf2d27c090ec6468.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=3600&X-Amz-Signature=abc123';
const CDN_URL = 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1-CXtrrkMpJ8Zq.png';

test('detects signed/expirable image URLs', () => {
  assert.equal(isExpirableImageUrl(SIGNED_B2_URL), true);
  assert.equal(isExpirableImageUrl('https://cdn.example.com/a.jpg?Expires=123&Signature=xyz'), true);
  assert.equal(isExpirableImageUrl('https://cdn.example.com/a.jpg?sig=xyz'), true);
});

test('keeps plain CDN image URLs', () => {
  assert.equal(isExpirableImageUrl(CDN_URL), false);
  assert.equal(isExpirableImageUrl('https://media.kitsu.app/anime/poster_images/1/large.jpg'), false);
  assert.equal(isExpirableImageUrl(null), false);
  assert.equal(isExpirableImageUrl(''), false);
  assert.equal(isExpirableImageUrl('   '), false);
});

test('sanitizeCoverImage drops signed or blank URLs and trims the rest', () => {
  assert.equal(sanitizeCoverImage(SIGNED_B2_URL), null);
  assert.equal(sanitizeCoverImage('  '), null);
  assert.equal(sanitizeCoverImage(null), null);
  assert.equal(sanitizeCoverImage(undefined), null);
  assert.equal(sanitizeCoverImage(`  ${CDN_URL}  `), CDN_URL);
});
