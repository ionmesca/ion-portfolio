/**
 * Where the rail's back button goes, and what it says. The letter and the
 * three collections go Home; an article goes back to its index (POR-27:
 * "destination-labelled back button").
 *
 * Lives in its own plain module on purpose. `section-rail.tsx` is
 * `"use client"`, and a value imported from a client module into a server
 * component (`rail-shell.tsx`) arrives as a client-reference stub, not the
 * object — `RAIL_HOME.href` read as undefined and the phone's back button
 * rendered with no href and no label.
 */
export type RailBack = { href: string; label: string }

export const RAIL_HOME: RailBack = { href: "/", label: "Home" }
