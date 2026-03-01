/**
 * Atom feed fetching
 * @module
 */

import { parse, xml_node } from "jsr:@libs/xml@7";

import { FeedTarget, FetchResult } from "../types.ts";
import { is_resource_exists, to_full_url_when_not } from "../util.ts";


/**
 * Atom feed fetching
 *
 * @param target Target Atom feed to fetch
 * @param general_timeout_ms Limit duration of fetching in milliseconds
 * @returns Extracted posts
 */
export async function fetch_atom(target: FeedTarget, general_timeout_ms?: number): Promise<FetchResult> {
  // Try to fetch
  const timeout_ms = target.timeout_ms || general_timeout_ms;
  const signal = timeout_ms ? AbortSignal.timeout(timeout_ms) : undefined;
  const res = await fetch(target.url, { headers: target.headers, signal }).catch((err: Error) => err);

  if(res instanceof Error) {
    const is_timeout_error = res.name === "TimeoutError";
    return {
      posts: [],
      fail_reasons: [{
        target, severity: "error",
        category: is_timeout_error ? "TimeoutError" : "FetchParamError",
        detail: is_timeout_error ? "Request timeout" : `${res}`
      }]
    };
  }
  if(!res.ok) {
    await res.bytes();
    return {
      posts: [],
      fail_reasons: [{ target, severity: "error", category: "HTTPError", detail: `${res.statusText}` }]
    };
  }


  // XML root element extraction
  const xml = await res.text().then(text => parse(text)).catch((err: Error) => err);
  if(xml instanceof Error)
    return {
      posts: [],
      fail_reasons: [{ target, severity: "error", category: "ParseError", detail: `${xml}` }]
    };
  const feed = <xml_node | undefined>xml["~children"].find(e => e["~name"] === "feed");
  if(!feed) {
    return {
      posts: [],
      fail_reasons: [{ target, severity: "error", category: "DataMissing", detail: "<feed> tag required, but not found" }]
    };
  }


  // <feed> contents extraction
  const root_author_node       = <xml_node | undefined>feed["~children"].find(e => e["~name"] === "author");
  const root_author_name_node  = root_author_node ? root_author_node["~children"].find(node => node["~name"] === "name")  : undefined;
  const root_author_email_node = root_author_node ? root_author_node["~children"].find(node => node["~name"] === "email") : undefined;
  const root_author_uri_node   = root_author_node ? root_author_node["~children"].find(node => node["~name"] === "uri")   : undefined;
  const root_author_name_str   = root_author_name_node  ? root_author_name_node["#text"]  : undefined;
  const root_author_email_str  = root_author_email_node ? root_author_email_node["#text"] : undefined;
  const root_author_email_uri  = root_author_email_str  ? ("mailto:" + root_author_email_str) : undefined;
  const root_author_uri_str    = root_author_uri_node   ? to_full_url_when_not(root_author_uri_node["#text"], target.url) : undefined;

  const root_link_node = <xml_node | undefined>feed["~children"].find(e => e["~name"] === "link");
  const root_link_str  = root_link_node && (typeof root_link_node["@href"] === "string") ? to_full_url_when_not(root_link_node["@href"], target.url) : undefined;

  const root_icon_node = <xml_node | undefined>feed["~children"].find(e => e["~name"] === "icon");
  const root_icon_str  = root_icon_node ? to_full_url_when_not(root_icon_node["#text"], target.url) : undefined;

  const root_logo_node = <xml_node | undefined>feed["~children"].find(e => e["~name"] === "logo");
  const root_logo_str  = root_logo_node ? to_full_url_when_not(root_logo_node["#text"], target.url) : undefined;

  const root_subtitle_node = <xml_node | undefined>feed["~children"].find(e => e["~name"] === "subtitle");
  const root_subtitle_str  = root_subtitle_node?.["#text"];


  // Other core data
  const site_name     = new URL(target.url).hostname;
  const site_origin   = new URL(target.url).origin;
  const site_icon_url = await is_resource_exists(site_origin + "/favicon.ico", target.headers) ? (site_origin + "/favicon.ico") : undefined;


  // <entry> elements extraction
  const entries = <xml_node[]>(<xml_node>feed)["~children"].filter(node => node["~name"] === "entry");
  if(entries.length === 0) {
    return {
      posts: [],
      fail_reasons: [{ target, severity: "warning", category: "DataMissing", detail: "No <entry> tags found, no posts fetched" }]
    };
  }


  // <entry> contents extraction
  const fetch_result: FetchResult = { posts: [], fail_reasons: [] };
  entries.forEach((entry, index) => {
    // Required elements
    const title_node = entry?.["~children"].find(node => node["~name"] === "title");
    if(!title_node) {
      fetch_result.fail_reasons.push({
        target, severity: "error", category: "DataMissing", detail: `At an <entry> tag index ${index}, <title> tag required, but not found`
      });
      return;
    }
    const title_str = title_node["#text"];

    const updated_node = entry?.["~children"].find(node => node["~name"] === "updated");
    if(!updated_node) {
      fetch_result.fail_reasons.push({
        target, severity: "error", category: "DataMissing", detail: `At an <entry> tag index ${index}, <updated> tag required, but not found`
      });
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
    const author_uri_str    = author_uri_node   ? to_full_url_when_not(author_uri_node["#text"], target.url) : undefined;

    const content_node = <xml_node | undefined>entry?.["~children"].find(node => node["~name"] === "content");
    const content_str  = content_node ? content_node["#text"] : undefined;

    const link_node = <xml_node | undefined>entry?.["~children"].find(node => node["~name"] === "link");
    const link_str  = link_node && (typeof link_node["@href"] === "string") ? link_node["@href"] : undefined;

    const summary_node = <xml_node | undefined>entry?.["~children"].find(node => node["~name"] === "summary");
    const summary_str  = summary_node ? summary_node["#text"] : undefined;

    const published_node = <xml_node | undefined>entry?.["~children"].find(node => node["~name"] === "published");
    const published_date = published_node ? new Date(published_node["#text"]) : undefined;

    fetch_result.posts.push({
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
    });
  });

  return fetch_result;
}
