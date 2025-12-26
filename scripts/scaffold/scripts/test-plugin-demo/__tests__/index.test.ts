import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exampleUtil } from '../utils';


describe('test-plugin-demo', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('utils', () => {
    it('exampleUtil transforms input correctly', () => {
      expect(exampleUtil('hello')).toBe('HELLO');
    });
  });

});
