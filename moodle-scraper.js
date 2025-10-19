// moodle-scraper.js
const axios = require('axios');
const cheerio = require('cheerio');

const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || 'moodle,edu')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return cors(200, '');
    }

    const body = safeJson(event.body);
    const { moodleUrl, htmlContent } = body || {};
    let assignments = [];

    if (htmlContent && typeof htmlContent === 'string' && htmlContent.trim()) {
      assignments = parseMoodleHTML(htmlContent);
    } else if (moodleUrl && isAllowedHost(moodleUrl)) {
      // Works only if the URL is publicly accessible (no login)
      const html = await fetchHtml(moodleUrl);
      assignments = parseMoodleHTML(html);
    } else {
      return cors(400, { error: 'Provide htmlContent or an allowed moodleUrl' });
    }

    return cors(200, { success: true, assignments, count: assignments.length });
  } catch (err) {
    console.error('ERROR', err);
    return cors(500, { error: 'Failed to process Moodle data', details: String(err.message || err) });
  }
};

// ---------- helpers ----------
function cors(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
      'Access-Control-Allow-Methods': 'OPTIONS,POST',
      'Content-Type': 'application/json'
    },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  };
}

function safeJson(s) {
  try { return s ? JSON.parse(s) : {}; } catch { return {}; }
}

function isAllowedHost(url) {
  try {
    const u = new URL(url);
    const host = (u.hostname || '').toLowerCase();
    return ALLOWED_HOSTS.some(part => host.includes(part));
  } catch { return false; }
}

async function fetchHtml(url) {
  const res = await axios.get(url, {
    timeout: 10000,
    headers: { 'User-Agent': 'PlannerBot/1.0 (+lambda)' }
  });
  return res.data;
}

// light parser; tweak selectors for your Moodle theme if needed
function parseMoodleHTML(html) {
  const $ = cheerio.load(html);
  const out = [];

  // Strategy 1: assignment/activity cards
  $('.activity.assign, .activity[data-type="assign"], .assign, [class*="assignment"]').each((i, el) => {
    const $el = $(el);
    const title =
      $el.find('.instancename, .activityname, [class*="title"]').first().text().trim()
      || textClip($el.text(), 80) || 'Moodle Assignment';

    const text = $el.text().replace(/\s+/g, ' ').trim();
    const due = extractDue(text);

    if (due) {
      out.push({
        title: clean(title),
        dueDate: due,
        course: $('title').text().replace(/Moodle/i, '').trim() || 'Course',
        type: 'assignment',
        source: 'aws_moodle_parser'
      });
    }
  });

  // Strategy 2: calendar/event blocks
  $('.event, [class*="calendar"]').each((i, el) => {
    const t = $(el).text();
    if (/assignment|due/i.test(t)) {
      out.push({
        title: clean(textClip(t, 100)) || 'Course event',
        dueDate: extractDue(t) || new Date().toDateString(),
        course: 'Moodle Calendar',
        type: 'event',
        source: 'aws_calendar_parser'
      });
    }
  });

  return dedupe(out);
}

function extractDue(text) {
  const m1 = text.match(/due\s*:?\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4})/i);
  if (m1) return m1[1];
  const m2 = text.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (m2) return m2[1];
  return null;
}

function textClip(s, n) { return (s || '').trim().slice(0, n); }
function clean(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

function dedupe(list) {
  const seen = new Set();
  return list.filter(a => {
    const key = (a.title || '') + '|' + (a.dueDate || '');
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}
