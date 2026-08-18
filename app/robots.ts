import type { MetadataRoute } from "next"

import { SITE_URL } from "./layout"

/**
 * robots.txt.
 *
 * Open to everything, including the AI crawlers — this is a portfolio whose
 * job is to be read, quoted and found, and the one place a `Disallow` would
 * actually cost something is a hiring manager's search. The only exception is
 * `/dev`, the unlinked specimen route, which is also `noindex` in its own
 * metadata and is deleted before cutover.
 *
 * The sitemap line is what makes the sitemap discoverable without anyone
 * submitting it anywhere.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/dev",
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  }
}
