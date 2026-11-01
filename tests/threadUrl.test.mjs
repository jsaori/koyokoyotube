import test from "node:test";
import assert from "node:assert/strict";
import { isThreadUrl } from "../src/libs/threadUrl.mjs";

test("登録フォームで既存形式と両方の5chドメインを受け付ける", () => {
  for (const url of [
    "https://eagle.5ch.io/test/read.cgi/livejupiter/1725015690/",
    "https://itest.5ch.net/eagle/test/read.cgi/livejupiter/1725015690/1-100",
    "https://eagle.5ch.net/test/read.cgi/c/livejupiter/1725015690",
    "https://jbbs.shitaraba.net/bbs/read_archive.cgi/internet/25835/1694773647/l30",
    "http://bbs.jpnkn.com/test/read.cgi/hkikyr/1695549783/",
  ]) assert.equal(isThreadUrl(url), true, url);
  for (const url of [
    "https://evil.example/5ch.io/test/read.cgi/livejupiter/1725015690/",
    "https://eagle.5ch.io/test/read.cgi/livejupiter/1725015690/?redirect=1",
    "https://jbbs.shitaraba.net/bbs/read.cgi/internet/99999/1694773647/",
    "",
  ]) assert.equal(isThreadUrl(url), false, url);
});
