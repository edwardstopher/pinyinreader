export const SITE: string;
export const routes: string[];
export function pageUrl(path: string): string;
export function sitemapXml(paths: string[], lastmod: string): string;
export function lastmodFromGit(): string;
