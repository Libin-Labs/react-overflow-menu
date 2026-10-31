import { beforeEach, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { setup, click, key } from './helpers.mjs';
import { OverflowMenu } from '../dist/index.js';
let ui;
beforeEach(async () => (ui = await setup()));
afterEach(async () => ui.cleanup());
test('measured overflow actions stay available in a keyboard-driven menu', async () => {
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    return {
      width: this.tagName === 'BUTTON' ? (this.textContent === 'More actions' ? 50 : 60) : 140,
      height: 32,
      top: 0,
      left: 0,
      right: 140,
      bottom: 32,
    };
  };
  let selected = '';
  await ui.render(
    createElement(OverflowMenu, {
      actions: ['A', 'B', 'C'].map((id) => ({
        id,
        label: id,
        onSelect: () => {
          selected = id;
        },
      })),
    }),
  );
  const toolbar = ui.container.querySelector('[role="toolbar"]');
  assert.equal(toolbar.querySelectorAll('button').length, 2);
  await click(
    [...toolbar.querySelectorAll('button')].find((button) => button.textContent === 'More actions'),
  );
  const menu = ui.container.querySelector('[role="menu"]');
  assert.equal(menu.querySelectorAll('button').length, 2);
  await key(menu.querySelector('button'), 'ArrowDown');
  assert.equal(document.activeElement.textContent, 'C');
  await click(document.activeElement);
  assert.equal(selected, 'C');
});
