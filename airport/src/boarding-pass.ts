export function boardingPassMarkup() {
  return `<div class="pass-tools"><div class="pass-layout-switch" role="group" aria-label="Boarding pass layout"><button type="button" data-pass-format="paper" aria-pressed="true">Paper pass</button><button type="button" data-pass-format="mobile" aria-pressed="false">Mobile pass</button></div><span>YOUR NEXT CONNECTION</span></div>
<article class="travel-pass" data-format="paper" aria-label="Zaw Lin Naing First Class portfolio boarding pass"><div class="ticket-main"><header class="ticket-header"><div class="ticket-brand">ZLN<span>TERMINAL</span></div><div class="ticket-cabin">FIRST CLASS<small>BOARDING PASS</small></div></header><div class="ticket-passenger"><span>PASSENGER</span><strong>ZAW LIN NAING</strong><small>HON CIRCLE MEMBER</small></div><div class="ticket-route"><div><span>DEPARTURE</span><strong>ZRH</strong><small>Zürich</small></div><svg aria-hidden="true" viewBox="0 0 64 64" fill="currentColor"><path d="m59 30-23-8L25 4h-5l5 23-16-3-5-7H1l3 14-3 14h3l5-7 16-3-5 23h5l11-18 23-8z"/></svg><div><span>ARRIVAL</span><strong>LAX</strong><small>Los Angeles</small></div></div><div class="ticket-fields"><div><span>FLIGHT</span><b>DEV026</b></div><div><span>GATE</span><b>E52</b></div><div><span>SEAT</span><b>01A</b></div><div><span>BOARDING</span><b>OPEN</b></div></div><div class="ticket-priority">FIRST CLASS · PRIORITY BOARDING</div><div class="ticket-qr-area"><div class="ticket-message"><strong>A new direction.</strong><p>From aviation to software.<br>Let’s build what’s next.</p><small>RGN — ZRH — LAX</small></div><div class="ticket-code"><div class="qr-choice" role="group" aria-label="QR code destination"><button type="button" data-qr="github" aria-pressed="true">GitHub</button><button type="button" data-qr="resume" aria-pressed="false">Résumé</button></div><a class="qr-link" href="https://github.com/normanlinn" target="_blank" rel="noopener noreferrer"><img class="pass-qr" src="assets/qr-github.png" width="164" height="164" alt="QR code linking to Norman Linn’s GitHub profile"></a><a class="qr-caption" href="https://github.com/normanlinn" target="_blank" rel="noopener noreferrer">Scan or tap for GitHub</a></div></div><footer class="ticket-footer"><span>SOFTWARE DEVELOPER</span><span>LOS ANGELES</span></footer></div><aside class="ticket-stub" aria-label="Boarding pass stub"><span>FIRST CLASS</span><strong>ZAW LIN<br>NAING</strong><div class="stub-route">ZRH<br><span>TO</span><br>LAX</div><dl><div><dt>FLIGHT</dt><dd>DEV026</dd></div><div><dt>SEAT</dt><dd>01A</dd></div><div><dt>STATUS</dt><dd>HON CIRCLE</dd></div></dl><span class="stub-end">READY FOR YOUR NEXT IDEA</span></aside></article><div class="pass-contact"><a class="button primary" href="mailto:mrzawlinnaing1001@gmail.com">Let’s work together</a><a href="assets/zaw-lin-naing-resume.pdf" target="_blank" rel="noopener">Read résumé</a></div>`;
}
export function mountBoardingPass(container: HTMLElement) {
  const pass = container.querySelector<HTMLElement>('.travel-pass')!;
  function setFormat(format: string) {
    pass.dataset.format = format;
    container
      .querySelectorAll<HTMLButtonElement>('[data-pass-format]')
      .forEach(button => button.setAttribute('aria-pressed', String(button.dataset.passFormat === format)));
  }
  setFormat(matchMedia('(max-width:600px)').matches ? 'mobile' : 'paper');
  container
    .querySelectorAll<HTMLButtonElement>('[data-pass-format]')
    .forEach(button => button.addEventListener('click', () => setFormat(button.dataset.passFormat!)));
  const destinations = {
    github: {
      url: 'https://github.com/normanlinn',
      image: 'qr-github.png',
      label: 'GitHub',
      alt: 'QR code linking to Norman Linn’s GitHub profile',
    },
    resume: {
      url: 'https://normanlinn.github.io/assets/zaw-lin-naing-resume.pdf',
      image: 'qr-resume.png',
      label: 'résumé',
      alt: 'QR code linking to Zaw Lin Naing’s résumé PDF',
    },
  };
  container.querySelectorAll<HTMLButtonElement>('[data-qr]').forEach(button =>
    button.addEventListener('click', () => {
      const choice = destinations[button.dataset.qr as keyof typeof destinations];
      container
        .querySelectorAll<HTMLButtonElement>('[data-qr]')
        .forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      const image = container.querySelector<HTMLImageElement>('.pass-qr')!;
      image.src = 'assets/' + choice.image;
      image.alt = choice.alt;
      const link = container.querySelector<HTMLAnchorElement>('.qr-link')!,
        caption = container.querySelector<HTMLAnchorElement>('.qr-caption')!;
      link.href = caption.href = choice.url;
      caption.textContent = 'Scan or tap for ' + choice.label;
    }),
  );
}
