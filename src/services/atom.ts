/**
 * Atom feed fetching
 * @module
 */

import { red, yellow } from "jsr:@std/fmt@1/colors";
import { parse, xml_node } from "jsr:@libs/xml@7";

import { Post } from "../types.ts";
import { is_resource_exists, to_absolute_when_relative } from "../util.ts";


/**
 * Atom feed fetching
 *
 * @param atom_url URL of Atom XML
 * @param headers Headers of HTTP fetching
 * @param timeout_ms Limit duration of fetching in milliseconds
 * @returns Extracted posts
 */
export async function fetch_atom(atom_url: string, headers?: HeadersInit, timeout_ms?: number): Promise<Post[]> {
  // Try to fetch
  const signal = timeout_ms ? AbortSignal.timeout(timeout_ms) : undefined;
  const res = await fetch(atom_url, { headers, signal }).catch(err => {
    console.error(red(`Fetch from Atom ${atom_url} - Failed to fetch cause: ${err}`));
  });
  if(!res)
    return[];
  if(!res.ok) {
    console.error(red(`Fetch from Atom ${atom_url} - HTTP error respond: ${res.statusText}`));
    await res.bytes();
    return [];
  }


  // XML root element extraction
  const xml = await res.text().then(text => parse(text)).catch(err => {
    console.error(red(`Fetch from Atom ${atom_url} - Failed to parse XML cause: ${err}`));
  });
  if(!xml)
    return [];
  const feed = <xml_node | undefined>xml["~children"].find(e => e["~name"] === "feed");
  if(!feed) {
    console.error(red(`Fetch from Atom ${atom_url} - <feed> tag not found`));
    return [];
  }


  // <feed> contents extraction
  const root_author_node       = <xml_node | undefined>feed["~children"].find(e => e["~name"] === "author");
  const root_author_name_node  = root_author_node ? root_author_node["~children"].find(node => node["~name"] === "name")  : undefined;
  const root_author_email_node = root_author_node ? root_author_node["~children"].find(node => node["~name"] === "email") : undefined;
  const root_author_uri_node   = root_author_node ? root_author_node["~children"].find(node => node["~name"] === "uri")   : undefined;
  const root_author_name_str   = root_author_name_node  ? root_author_name_node["#text"]  : undefined;
  const root_author_email_str  = root_author_email_node ? root_author_email_node["#text"] : undefined;
  const root_author_email_uri  = root_author_email_str  ? ("mailto:" + root_author_email_str) : undefined;
  const root_author_uri_str    = root_author_uri_node   ? to_absolute_when_relative(root_author_uri_node["#text"], atom_url) : undefined;

  const root_link_node = <xml_node | undefined>feed["~children"].find(e => e["~name"] === "link");
  const root_link_str  = root_link_node && (typeof root_link_node["@href"] === "string") ? to_absolute_when_relative(root_link_node["@href"], atom_url) : undefined;

  const root_icon_node = <xml_node | undefined>feed["~children"].find(e => e["~name"] === "icon");
  const root_icon_str  = root_icon_node ? to_absolute_when_relative(root_icon_node["#text"], atom_url) : undefined;

  const root_logo_node = <xml_node | undefined>feed["~children"].find(e => e["~name"] === "logo");
  const root_logo_str  = root_logo_node ? to_absolute_when_relative(root_logo_node["#text"], atom_url) : undefined;

  const root_subtitle_node = <xml_node | undefined>feed["~children"].find(e => e["~name"] === "subtitle");
  const root_subtitle_str  = root_subtitle_node?.["#text"];


  // Other core data
  const site_name     = new URL(atom_url).hostname;
  const site_origin   = new URL(atom_url).origin;
  const site_icon_url = await is_resource_exists(site_origin + "/favicon.ico", headers) ? (site_origin + "/favicon.ico") : undefined;


  // <entry> elements extraction
  const entries = <xml_node[]>(<xml_node>feed)["~children"].filter(node => node["~name"] === "entry");
  if(entries.length === 0) {
    console.warn(yellow(`Fetch from Atom ${atom_url} - No <entry> tags found`));
    return [];
  }


  // <entry> contents extraction
  const posts = entries.map((entry): Post | undefined => {
    // Required elements
    const title_node = entry?.["~children"].find(node => node["~name"] === "title");
    if(!title_node) {
      console.error(red(`Fetch from Atom ${atom_url} - <title> tag required in a <entry>, but not found`));
      return;
    }
    const title_str = title_node["#text"];

    const updated_node = entry?.["~children"].find(node => node["~name"] === "updated");
    if(!updated_node) {
      console.error(red(`Fetch from Atom ${atom_url} - <updated> tag required in a <entry>, but not found`));
      return;
    }
    const updated_date = new Date(updated_node["#text"]);

    const author_node       = <xml_node | undefined>entry?.["~children"].find(node => node["~name"] === "author");
    const author_name_node  = author_node ? author_node["~children"].find(node => node["~name"] === "name")  : undefined;
    const author_email_node = author_node ? author_node["~children"].find(node => node["~name"] === "email") : undefined;
    const author_uri_node   = author_node ? author_node["~children"].find(node => node["~name"] === "uri")   : undefined;
    const author_name_str   = author_name_node  ? author_name_node["#text"]  : undefined;
    const author_email_str  = author_email_node ? author_email_node["#text"] : undefined;
    const author_email_uri  = author_email_str  ? ("mailto:" + author_email_str) : undefined;
    const author_uri_str    = author_uri_node   ? to_absolute_when_relative(author_uri_node["#text"], atom_url) : undefined;

    const content_node = <xml_node | undefined>entry?.["~children"].find(node => node["~name"] === "content");
    const content_str  = content_node ? content_node["#text"] : undefined;

    const link_node = <xml_node | undefined>entry?.["~children"].find(node => node["~name"] === "link");
    const link_str  = link_node && (typeof link_node["@href"] === "string") ? link_node["@href"] : undefined;

    const summary_node = <xml_node | undefined>entry?.["~children"].find(node => node["~name"] === "summary");
    const summary_str  = summary_node ? summary_node["#text"] : undefined;

    const published_node = <xml_node | undefined>entry?.["~children"].find(node => node["~name"] === "published");
    const published_date = published_node ? new Date(published_node["#text"]) : undefined;

    return {
      site_name: site_name,
      site_icon_url: root_icon_str || site_icon_url,
      title: title_str,
      url: link_str || root_link_str || site_origin,
      author_name: author_name_str || root_author_name_str || site_name,
      author_url: author_uri_str || root_author_uri_str || author_email_uri || root_author_email_uri,
      author_icon_url: undefined,
      description: summary_str || content_str || root_subtitle_str,
      thumbnail_url: root_logo_str,
      post_date: published_date,
      update_date: updated_date
    };
  });

  return posts.filter(e => e !== undefined);
}
