import type { Project } from './projects.ts';

const escape = (text: string) =>
  text.replace(
    /[&<>"]/g,
    character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]!,
  );

const external = 'target="_blank" rel="noopener noreferrer"';

/**
 * A project case study. Used by the 3D gate panel and the Quick view page, so both always show the
 * same content. `assetBase` is the path from the page to the assets folder. The clip starts paused
 * with its poster; callers start it only when motion is allowed.
 */
export function caseStudyMarkup(project: Project, assetBase: string, headingLevel: 2 | 3 = 2): string {
  const h = `h${headingLevel}`;
  const sub = `h${headingLevel + 1}`;
  const media = project.clip
    ? `<video class="project-preview case-clip" src="${assetBase}${project.clip}" poster="${assetBase}${project.image}" width="1440" height="900" muted loop playsinline preload="none" aria-label="${escape(project.name)}: a short silent recording of the live site"></video>`
    : `<img class="project-preview" src="${assetBase}${project.image}" width="1440" height="900" alt="${escape(project.name)} desktop preview" loading="lazy">`;
  const sections = (
    [
      ['The problem', project.problem],
      ['What I built', project.built],
      ['The hard part', project.hardest],
    ] as const
  )
    .map(([title, text]) => `<section><${sub}>${title}</${sub}><p>${escape(text)}</p></section>`)
    .join('');
  return (
    `<article class="case-study" id="case-${project.id}">` +
    `<span class="gate-tag">GATE ${project.gate}</span>` +
    `<${h}>${escape(project.name)}</${h}>` +
    `<p class="panel-kind">${escape(project.kind)}</p>` +
    `<p class="case-summary">${escape(project.summary)}</p>` +
    `<figure class="case-media">${media}</figure>` +
    `<div class="case-sections">${sections}</div>` +
    `<ul class="case-results" aria-label="Results">${project.results.map(r => `<li>${escape(r)}</li>`).join('')}</ul>` +
    `<ul class="case-stack" aria-label="Built with">${project.stack.map(s => `<li>${escape(s)}</li>`).join('')}</ul>` +
    `<div class="panel-links"><a class="button primary" href="${project.url}" ${external}>Visit live site <span>↗</span></a>` +
    (project.source
      ? `<a class="button secondary" href="${project.source}" ${external}>View source</a>`
      : '') +
    `</div></article>`
  );
}

/** Start case-study clips that are on screen, only when the visitor allows motion. */
export function playClips(root: ParentNode, reducedMotion: boolean): void {
  root.querySelectorAll<HTMLVideoElement>('video.case-clip').forEach(video => {
    if (reducedMotion) {
      video.controls = true;
      return;
    }
    video.preload = 'auto';
    // play() is refused when the browser blocks autoplay; the poster frame stays visible then.
    video.play().catch(() => (video.controls = true));
  });
}
