/**
 * RSS feed fetching
 * @module
 */

import { parse, xml_node } from "jsr:@libs/xml@7";

import { Feed, FetchResult } from "../types.ts";
import { is_resource_exists, to_full_url_when_not } from "../util.ts";


/**
 * RSS feed fetching
 *
 * @param target Target RSS feed to fetch
 * @param general_timeout_ms Limit duration of fetching in milliseconds
 * @returns Extracted posts
 */
export async function fetch_rss(target: Feed, general_timeout_ms?: number): Promise<FetchResult> {
  // Try to fetch
  const timeout_ms = target.timeout_ms || general_timeout_ms;
  const signal = timeout_ms ? AbortSignal.timeout(timeout_ms) : undefined;
  const res = await fetch(target.url, { headers: target.headers, signal }).catch((err: TypeError | DOMException) => err);

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
  const rss = <xml_node | undefined>xml["~children"].find(node => node["~name"] === "rss");
  if(!rss) {
    return {
      posts: [],
      fail_reasons: [{ target, severity: "error", category: "DataMissing", detail: "<rss> tag required, but not found" }]
    };
  }
  const channel = <xml_node | undefined>rss["~children"].find(node => node["~name"] === "channel");
  if(!channel) {
    return {
      posts: [],
      fail_reasons: [{ target, severity: "error", category: "DataMissing", detail: "<channel> tag required, but not found" }]
    };
  }

  // <channel> required contents extraction
  const root_title_node = <xml_node | undefined>channel["~children"].find(node => node["~name"] === "title");
  if(!root_title_node) {
    return {
      posts: [],
      fail_reasons: [{ target, severity: "error", category: "DataMissing", detail: "At <channel> tag, <title> tag required, but not found" }]
    };
  }
  const root_title_str  = root_title_node["#text"];

  const root_link_node = <xml_node | undefined>channel["~children"].find(node => node["~name"] === "link");
  if(!root_link_node) {
    return {
      posts: [],
      fail_reasons: [{ target, severity: "error", category: "DataMissing", detail: "At <channel> tag, <link> tag required, but not found" }]
    };
  }
  const root_link_str  = root_link_node["#text"];

  const root_description_node = <xml_node | undefined>channel["~children"].find(node => node["~name"] === "description");
  if(!root_description_node) {
    return {
      posts: [],
      fail_reasons: [{ target, severity: "error", category: "DataMissing", detail: "At <channel> tag, <description> tag required, but not found" }]
    };
  }
  const root_description_str  = root_description_node["#text"];


  // <channel> optional contents extraction
  const root_copyright_node = <xml_node | undefined>channel["~children"].find(node => node["~name"] === "copyright");
  const root_copyright_str  = root_copyright_node ? root_copyright_node["#text"] : undefined;

  const root_managing_editor_node      = <xml_node | undefined>channel["~children"].find(node => node["~name"] === "managingEditor");
  const root_managing_editor_info      = root_managing_editor_node ? mail_name_separate(root_managing_editor_node["#text"]) : undefined;
  const root_managing_editor_email_uri = root_managing_editor_info?.email ? ("mailto:" + root_managing_editor_info.email) : undefined;
  const root_managing_editor_name      = root_managing_editor_info?.name  ? root_managing_editor_info.name : undefined;

  const root_web_master_node      = <xml_node | undefined>channel["~children"].find(node => node["~name"] === "webMaster");
  const root_web_master_info      = root_web_master_node ? mail_name_separate(root_web_master_node["#text"]) : undefined;
  const root_web_master_email_uri = root_web_master_info?.email ? ("mailto:" + root_web_master_info.email) : undefined;
  const root_web_master_name      = root_web_master_info?.name  ? root_web_master_info.name : undefined;

  const root_pub_date_node = <xml_node | undefined>channel["~children"].find(node => node["~name"] === "pubDate");
  const root_pub_date_date = root_pub_date_node ? new Date(root_pub_date_node["#text"]) : undefined;

  const root_image_node     = <xml_node | undefined>channel["~children"].find(node => node["~name"] === "image");
  const root_image_url_node = root_image_node ? <xml_node | undefined>root_image_node["~children"].find(node => node["~name"] === "url") : undefined;
  const root_image_url_str  = root_image_url_node ? to_full_url_when_not(root_image_url_node["#text"], target.url) : undefined;


  // Other core data
  const site_name     = new URL(target.url).hostname;
  const site_origin   = new URL(target.url).origin;
  const site_icon_uri = await is_resource_exists(site_origin + "/favicon.ico", target.headers) ? (site_origin + "/favicon.ico") : undefined;


  // <item> elements extraction
  const items = <xml_node[]>(<xml_node>channel)["~children"].filter(node => node["~name"] === "item");
  if(items.length === 0) {
    return {
      posts: [],
      fail_reasons: [{ target, severity: "warning", category: "DataMissing", detail: "No <item> tags found, no posts fetched" }]
    };
  }


  // <item> contents extraction
  const fetch_result: FetchResult = { posts: [], fail_reasons: [] };
  items.forEach((entry, index) => {
    // Required elements
    const title_node       = entry?.["~children"].find(node => node["~name"] === "title");
    const description_node = entry?.["~children"].find(node => node["~name"] === "description");
    const title_str        = title_node       ? title_node["#text"]       : undefined;
    const description_str  = description_node ? description_node["#text"] : undefined;
    if(!title_node && !description_node) {
      fetch_result.fail_reasons.push({
        target, severity: "error", category: "DataMissing", detail: `At an <item> tag index ${index}, <title> or <description> tag required, but not found`
      });
      return;
    }

    const link_node = entry?.["~children"].find(node => node["~name"] === "link");
    const link_str  = link_node ? link_node["#text"] : undefined;

    const author_node      = <xml_node | undefined>entry?.["~children"].find(node => node["~name"] === "author");
    const author_info      = author_node ? mail_name_separate(author_node["#text"]) : undefined;
    const author_email_uri = author_info?.email ? ("mailto:" + author_info.email) : undefined;
    const author_name      = author_info?.name  ? author_info.name : undefined;

    const enclosure_node    = <xml_node | undefined>entry?.["~children"].find(node => node["~name"] === "enclosure");
    const enclosure_url     = (enclosure_node && typeof enclosure_node["@url"] === "string") ? enclosure_node["@url"] : undefined;
    const enclosure_img_url = (enclosure_url && /\.(png|jpg|jpeg|gif|tif|tiff|webp)$/.test(enclosure_url)) ? enclosure_url : undefined;

    const pub_date_node = <xml_node | undefined>entry?.["~children"].find(node => node["~name"] === "pubDate");
    const pub_date_date = pub_date_node ? new Date(pub_date_node["#text"]) : undefined;

    fetch_result.posts.push({
      site_name: site_name,
      site_icon_url: site_icon_uri,
      title: title_str || root_title_str,
      url: link_str || root_link_str,
      author_name: author_name || root_managing_editor_name || root_web_master_name || root_copyright_str || site_name,
      author_url: author_email_uri || root_managing_editor_email_uri || root_web_master_email_uri,
      author_icon_url: undefined,
      description: description_str || root_description_str,
      thumbnail_url: enclosure_img_url || root_image_url_str,
      post_date: pub_date_date || root_pub_date_date,
      update_date: pub_date_date || root_pub_date_date || new Date()
    });
  });

  return fetch_result;
}


/**
 * Data structure for RSS author content
 */
interface author_info {
  email?: string,
  name?: string
}

/**
 * Separate author info of RSS content
 *
 * e.g. 'author_name@example.com (author name)' -> 'author_name@example.com' and 'author name'
 *
 * @param original_str Original string of author info att RSS
 * @returns Separated data of author info into email and name
 */
function mail_name_separate(original_str: string): author_info {
  const separated     = original_str.split(/\(|\)/);
  const trimmed       = separated.map(str => str.trim());
  const empty_removed = trimmed.filter(str => str !== "");

  return { email: empty_removed[0], name: empty_removed[1] };
}
