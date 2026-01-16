import { createShadowRootUi } from '#imports';

const iconUrl = '/icon/icon.svg?url';

type InspectUiController = {
  show: () => void;
  hide: () => void;
};

type InspectUiOptions = {
  onStop: () => void;
};

export const createInspectUi = async (
  ctx: Parameters<typeof createShadowRootUi>[0],
  { onStop }: InspectUiOptions,
): Promise<InspectUiController> => {
  let wrapper: HTMLDivElement | null = null;

  const ui = await createShadowRootUi(ctx, {
    name: 'slab-inspect-ui',
    position: 'inline',
    anchor: 'body',
    onMount(container) {
      const host = document.createElement('div');
      host.className = 'slab-inspect-ui';

      const icon = document.createElement('img');
      icon.className = 'slab-inspect-ui__icon';
      icon.src = iconUrl;
      icon.alt = 'Select like a Boss';

      const label = document.createElement('span');
      label.className = 'slab-inspect-ui__label';
      label.textContent = 'Inspect mode active';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'slab-inspect-ui__button';
      button.textContent = 'End Inspect';
      button.addEventListener('click', onStop);

      host.append(icon, label, button);
      container.append(host);
      wrapper = host;
      wrapper.style.display = 'none';
      return host;
    },
    onRemove() {
      wrapper?.remove();
      wrapper = null;
    },
  });

  ui.mount();

  return {
    show: () => {
      if (wrapper) wrapper.style.display = 'flex';
    },
    hide: () => {
      if (wrapper) wrapper.style.display = 'none';
    },
  };
};
