import assert from "node:assert/strict";
import {test} from "node:test";
import axios from "axios";
import {getVideoTitle} from "../src/libs/initYoutube.js";

test("video titles use the official oEmbed endpoint without an API key", async (t) => {
  const get = t.mock.method(axios, "get", async () => ({data: {title: "動画タイトル"}}));
  assert.equal(await getVideoTitle("mjbt0t7QyYA"), "動画タイトル");
  assert.deepEqual(get.mock.calls[0].arguments, ["https://www.youtube.com/oembed", {
    params: {url: "https://www.youtube.com/watch?v=mjbt0t7QyYA", format: "json"},
    timeout: 10000
  }]);
});

test("an empty video ID does not make a request", async (t) => {
  const get = t.mock.method(axios, "get", async () => {throw new Error("Unexpected request");});
  assert.equal(await getVideoTitle(""), "");
  assert.equal(get.mock.callCount(), 0);
});

test("a missing or invalid title preserves the empty-string result", async (t) => {
  t.mock.method(axios, "get", async () => ({data: {}}));
  assert.equal(await getVideoTitle("mjbt0t7QyYA"), "");
  axios.get.mock.mockImplementation(async () => ({data: {title: {}}}));
  assert.equal(await getVideoTitle("mjbt0t7QyYA"), "");
});

test("unavailable videos and request timeouts preserve the empty-string result", async (t) => {
  t.mock.method(console, "error", () => {});
  const get = t.mock.method(axios, "get", async () => {throw new Error("404");});
  assert.equal(await getVideoTitle("unavailable"), "");
  get.mock.mockImplementation(async () => {throw new Error("timeout");});
  assert.equal(await getVideoTitle("mjbt0t7QyYA"), "");
});
