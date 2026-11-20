import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.env.BASE_URL || 'http://127.0.0.1:4180';
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.context().grantPermissions(['clipboard-write'], { origin: base });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.terminalState?.ready);
  await page.waitForFunction(() => window.terminalState.aircraft.loaded);
  assert.equal(await page.evaluate(() => window.terminalState.aircraft.source), 'amvlab-a350');
  assert.equal(await page.evaluate(() => window.terminalState.aircraft.fanCount), 2);
  assert.equal(await page.evaluate(() => window.terminalState.aircraft.wheelCount), 10);
  assert.equal(await page.evaluate(() => window.terminalState.mode), 'scroll');
  assert.equal(await page.evaluate(() => window.terminalState.airport), 'zurich-dock-e');
  assert.equal(await page.evaluate(() => window.terminalState.fleet.b777), true);
  await page.waitForTimeout(400);
  const idleFrame = await page.evaluate(() => window.terminalState.renderedFrames);
  await page.waitForTimeout(200);
  assert.ok(
    (await page.evaluate(() => window.terminalState.renderedFrames)) <= idleFrame + 1,
    'Paused terminal keeps redrawing',
  );
  assert.ok(await page.locator('.brand-mark').evaluate(image => image.complete && image.naturalWidth > 0));
  assert.equal(await page.locator('#joystick,#mouse-look,.crosshair').count(), 0);
  const before = await page.evaluate(() => window.terminalState.position);
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(200);
  await page.keyboard.up('KeyW');
  assert.deepEqual(await page.evaluate(() => window.terminalState.position), before);
  await page.mouse.wheel(0, 900);
  await page.waitForFunction(() => window.terminalState.chapter === 'projects');
  for (const id of ['projects', 'about', 'skills', 'lounge']) {
    await page.locator('header [data-travel="' + id + '"]').click();
    await page.waitForFunction(id => window.terminalState.chapter === id, id);
    assert.ok(await page.locator('#' + id + ' .station-card').isVisible());
    const bounds = await page.locator('#' + id + ' .station-card').boundingBox();
    const header = await page.locator('.topbar').boundingBox();
    const footer = await page.locator('.bottom-bar').boundingBox();
    assert.ok(bounds.y >= header.y + header.height + 10, 'Card overlaps header');
    assert.ok(bounds.y + bounds.height <= footer.y - 5, 'Card overlaps footer');
  }
  for (const [id, url] of [
    ['lax', 'https://employeeshuttlelax.com/'],
    ['yay', 'https://yaykyawfair.vercel.app/'],
    ['tea', 'https://burmantea.vercel.app/'],
    ['calc', 'https://normanlinn.github.io/calculus-study-site/'],
  ]) {
    await page.locator('#directory-open').click();
    await page.locator('#directory [data-directory="' + id + '"]').click();
    assert.ok(await page.locator('#detail a[href="' + url + '"]').count());
    await page.locator('#detail .dialog-close').click();
  }
  await page.locator('#lounge [data-directory="lounge"]').click();
  assert.equal(await page.locator('.travel-pass').getAttribute('data-format'), 'paper');
  await page.locator('[data-pass-format="mobile"]').click();
  assert.equal(await page.locator('.travel-pass').getAttribute('data-format'), 'mobile');
  await page.locator('[data-qr="resume"]').click();
  assert.equal(
    await page.locator('.qr-link').getAttribute('href'),
    'https://normanlinn.github.io/assets/zaw-lin-naing-resume.pdf',
  );
  await page.locator('.pass-qr').evaluate(img => img.decode());
  assert.ok(await page.locator('.pass-qr').evaluate(img => img.complete && img.naturalWidth > 0));
  await page.locator('#copy-email').click();
  await page.waitForFunction(() => document.querySelector('#copy-email').textContent === 'Copied!');
  await page.locator('#detail .dialog-close').click();
  await page.locator('#watch-runway').click();
  await page.waitForFunction(() => window.terminalState.chapter === 'runway');
  await page.waitForFunction(() => window.terminalState.cameraMode === 'explore');
  const cameraBefore = await page.evaluate(() => window.terminalState.position);
  await page.mouse.move(700, 480);
  await page.mouse.down();
  await page.mouse.move(850, 510, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(250);
  assert.notDeepEqual(
    await page.evaluate(() => window.terminalState.position),
    cameraBefore,
    'Runway drag did not move the camera',
  );
  await page.locator('#runway-camera-reset').click();
  await page.locator('#runway-camera').click();
  assert.equal(await page.evaluate(() => window.terminalState.cameraMode), 'journey');
  assert.equal(await page.locator('#runway-view').getAttribute('aria-pressed'), 'true');
  await page.locator('#runway-view').click();
  await page.locator('#runway-view').click();
  await page.locator('#watch-landing').click();
  await page.waitForFunction(
    () => window.terminalState.aircraft.phase === 'landing' && window.terminalState.aircraft.position.x < -50,
  );
  const aircraftX = await page.evaluate(() => window.terminalState.aircraft.position.x);
  await page.waitForFunction(x => window.terminalState.aircraft.position.x > x + 0.5, aircraftX);
  assert.ok(await page.evaluate(() => window.terminalState.aircraft.position.z < -39));
  await page.locator('#motion-toggle').click();
  const paused = await page.evaluate(() => window.terminalState.aircraft.position.x);
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => window.terminalState.aircraft.position.x), paused);
  await page.locator('#runway-park').click();
  await page.locator('#watch-takeoff').click();
  await page.waitForFunction(() => window.terminalState.aircraft.phase === 'takeoff');
  await page.locator('#runway-park').click();
  await page.locator('[data-aircraft="b777"]').click();
  assert.equal(await page.evaluate(() => window.terminalState.aircraft.type), 'b777');
  assert.equal(await page.evaluate(() => window.terminalState.aircraft.wheelCount), 14);
  assert.equal(await page.locator('#aircraft-name').textContent(), 'BOEING 777-300ER');
  await page.locator('#watch-takeoff').click();
  await page.waitForFunction(() => window.terminalState.aircraft.phase === 'takeoff');
  await page.locator('#runway-park').click();
  await page.locator('[data-aircraft="a350"]').click();
  assert.equal(await page.evaluate(() => window.terminalState.aircraft.type), 'a350');
  await page.locator('#home').click();
  await page.waitForFunction(() => window.terminalState.chapter === 'arrivals');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(900);
  assert.ok(await page.evaluate(() => window.terminalState.position.z < 21));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#home').click();
  await page.waitForFunction(() => window.terminalState.chapter === 'arrivals');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  const card = await page.locator('#arrival .station-card').boundingBox();
  const footer = await page.locator('.bottom-bar').boundingBox();
  assert.ok(card.y + card.height <= footer.y + 1, 'Arrival card is covered by the footer');
  await page.locator('header [data-travel="lounge"]').click();
  await page.waitForFunction(() => window.terminalState.chapter === 'lounge');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.deepEqual(errors, []);
  await page.close();

  // Most visitors have animations on. Load with motion several times: a timing bug (negative frame
  // delta on the first frame) only showed up on some loads and threw on every frame afterwards.
  for (let attempt = 1; attempt <= 4; attempt++) {
    const moving = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      reducedMotion: 'no-preference',
    });
    const motionErrors = [];
    moving.on('pageerror', error => motionErrors.push(error.message));
    await moving.goto(base, { waitUntil: 'networkidle' });
    await moving.waitForFunction(() => window.terminalState?.ready);
    await moving.waitForTimeout(600);
    await moving.mouse.wheel(0, 700);
    await moving.waitForTimeout(900);
    assert.deepEqual(motionErrors, [], `Errors with motion on (load ${attempt})`);
    if (attempt === 1) {
      // Panels animate closed, and reopening during that animation must leave them open.
      const isOpen = () => moving.evaluate(() => document.querySelector('#directory').open);
      const waitClosed = message =>
        moving
          .waitForFunction(() => !document.querySelector('#directory').open, null, { timeout: 8000 })
          .catch(() => assert.fail(message));
      await moving.locator('#directory-open').click();
      await moving.locator('#directory .dialog-close').click();
      await waitClosed('Directory did not close after its exit animation');
      await moving.locator('#directory-open').click();
      await moving.locator('#directory .dialog-close').click();
      await moving.evaluate(() => document.querySelector('#directory-open').click());
      await moving.waitForTimeout(1500);
      assert.equal(await isOpen(), true, 'Reopening during the exit animation closed the directory');
      await moving.keyboard.press('Escape');
      await waitClosed('Escape did not close the directory');
    }
    await moving.close();
  }

  // Every card must stay clear of the top and bottom bars at common laptop and phone sizes.
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
    { width: 360, height: 640 },
  ]) {
    const sized = await browser.newPage({ viewport, reducedMotion: 'reduce' });
    await sized.goto(base, { waitUntil: 'networkidle' });
    await sized.waitForFunction(() => window.terminalState?.ready);
    for (const id of ['arrival', 'projects', 'about', 'skills', 'lounge']) {
      await sized.evaluate(id => document.getElementById(id).scrollIntoView({ block: 'start' }), id);
      await sized.waitForTimeout(150);
      const hidden = await sized.evaluate(id => {
        const top = document.querySelector('.topbar').getBoundingClientRect();
        const bottom = document.querySelector('.bottom-bar').getBoundingClientRect();
        const covered = [];
        // Headings and actions must be visible without scrolling inside the card. Body text may scroll.
        for (const el of document
          .getElementById(id)
          .querySelectorAll('h1, h2, a.button, button, .section-wayfinding')) {
          const box = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          if (!box.width || !box.height || style.visibility === 'hidden' || style.opacity === '0') continue;
          const card = el.closest('.station-card')?.getBoundingClientRect();
          const visibleBottom = Math.min(bottom.top, card ? card.bottom : Infinity);
          const visibleTop = Math.max(top.bottom, card ? card.top : -Infinity);
          if (box.bottom > visibleBottom + 1 || box.top < visibleTop - 1)
            covered.push(el.textContent.trim().slice(0, 40));
        }
        return covered;
      }, id);
      assert.deepEqual(hidden, [], `${viewport.width}x${viewport.height} ${id}: covered by a bar`);
    }
    await sized.close();
  }

  const fallback = await browser.newPage();
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
      return original.call(this, type, ...args);
    };
  });
  await fallback.goto(base, { waitUntil: 'networkidle' });
  await fallback.locator('#fallback-directory').click();
  await fallback.locator('#directory [data-directory="about"]').click();
  await fallback.locator('#detail').waitFor({ state: 'visible' });
  console.log(
    'Passed: scroll-led camera, no walking controls, six destinations, project links, email copy, flights, pause, mobile layout, motion-on loads, cards clear of the bars at 4 sizes, and WebGL fallback.',
  );
} finally {
  await browser.close();
}
