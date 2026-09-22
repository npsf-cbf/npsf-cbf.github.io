(() => {
  const abstractContent = document.getElementById('abstract-content');
  const abstractToggles = document.querySelectorAll('[data-abstract-toggle]');

  if (abstractContent) {
    abstractToggles.forEach(button => {
      button.addEventListener('click', () => {
        const expanded = abstractContent.hidden;
        abstractContent.hidden = !expanded;
        abstractToggles.forEach(toggle => {
          toggle.setAttribute('aria-expanded', String(expanded));
          const label = toggle.querySelector('[data-abstract-label]');
          if (label) {
            label.textContent = expanded ? 'less' : 'more';
            toggle.setAttribute('aria-label', expanded ? 'Hide abstract' : 'Show abstract');
          }
        });
      });
    });
  }

  const backdrop = document.querySelector('.video-backdrop');
  const hoverAvailable = window.matchMedia('(hover: hover) and (pointer: fine)');
  let activeVideo = null;

  function closePreview() {
    if (!activeVideo) return;

    const video = activeVideo;
    activeVideo = null;
    if (typeof video.hidePopover === 'function' && video.matches(':popover-open')) {
      video.hidePopover();
    }
    video.removeAttribute('popover');
    video.classList.remove('is-expanded');
    for (const property of ['top', 'left', 'width', 'height']) {
      video.style.removeProperty(`--preview-${property}`);
    }
    backdrop.classList.remove('is-visible');
  }

  function openPreview(video, frame) {
    if (activeVideo === video || document.fullscreenElement) return;

    closePreview();
    const margin = 24;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    const source = frame.getBoundingClientRect();
    const aspectRatio = source.width / source.height;
    const width = Math.min(1120, viewportWidth - margin * 2, (viewportHeight - margin * 2) * aspectRatio);
    if (width <= source.width) return;

    const height = width / aspectRatio;
    const left = Math.max(margin, Math.min(source.left + source.width / 2 - width / 2, viewportWidth - width - margin));
    const top = Math.max(margin, Math.min(source.top + source.height / 2 - height / 2, viewportHeight - height - margin));

    for (const [property, value] of Object.entries({ top, left, width, height })) {
      video.style.setProperty(`--preview-${property}`, `${value}px`);
    }
    activeVideo = video;
    video.classList.add('is-expanded');
    backdrop.classList.add('is-visible');
    if (typeof video.showPopover === 'function') {
      video.setAttribute('popover', 'auto');
      video.showPopover();
    }
  }

  document.querySelectorAll('.video-section .video-frame').forEach(frame => {
    const video = frame.querySelector('video');

    frame.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && hoverAvailable.matches) {
        openPreview(video, frame);
      }
    });

    frame.addEventListener('pointerleave', () => {
      if (activeVideo === video && !document.fullscreenElement) closePreview();
    });

    video.addEventListener('focusin', () => {
      if (video.matches(':focus-visible') && hoverAvailable.matches) {
        openPreview(video, frame);
      }
    });

    video.addEventListener('focusout', () => {
      if (activeVideo === video) closePreview();
    });

    video.addEventListener('toggle', event => {
      if (event.newState === 'closed' && activeVideo === video) closePreview();
    });
  });

  function dismissWithEscape(event) {
    if (event.key === 'Escape') closePreview();
  }
  document.addEventListener('keydown', dismissWithEscape, true);
  document.addEventListener('keyup', dismissWithEscape, true);
  document.addEventListener('fullscreenchange', closePreview);
  window.addEventListener('scroll', closePreview, { passive: true });
  window.addEventListener('resize', closePreview);
  window.addEventListener('blur', closePreview);
  hoverAvailable.addEventListener('change', closePreview);
})();
