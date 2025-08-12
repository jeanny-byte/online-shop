// Utility functions for the server

export function generateSlug(title: string): string {
  if (!title) {
    return '';
  }
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}


