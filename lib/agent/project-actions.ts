export type OpenProjectDetail = {
  slug: string;
  anchor?: string;
};

export const OPEN_PROJECT_EVENT = "ion:open-project";

export function requestOpenProject(detail: OpenProjectDetail) {
  const event = new CustomEvent<OpenProjectDetail>(OPEN_PROJECT_EVENT, {
    detail,
    cancelable: true,
  });

  const wasNotHandled = window.dispatchEvent(event);
  if (wasNotHandled) {
    window.location.href = `/work/${detail.slug}`;
  }
}
