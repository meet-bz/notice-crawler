import { chromium } from 'playwright';
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import juice from 'juice';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL이 필요합니다.' }, { status: 400 });
  }

  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    const html = await page.content();
    await browser.close();

    // CSS 인라인화
    const $ = cheerio.load(html);
    const inlinedHtml = juice($.html());

    return NextResponse.json({ html: inlinedHtml });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '크롤링 실패' }, { status: 500 });
  }
}
