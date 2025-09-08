import puppeteer from 'puppeteer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { url, selector } = await request.json();

  if (!url || !selector) {
    return NextResponse.json({ error: 'URL과 셀렉터가 필요합니다.' }, { status: 400 });
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    let content;
    if (Array.isArray(selector)) {
      // 여러 셀렉터 처리
      const contents = [];
      for (const sel of selector) {
        try {
          const text = await page.$eval(sel, el => el.textContent);
          contents.push({ selector: sel, content: text });
        } catch (e) {
          contents.push({ selector: sel, content: null });
        }
      }
      content = contents;
    } else {
      // 단일 셀렉터
      content = await page.$eval(selector, el => el.textContent);
    }

    await browser.close();

    return NextResponse.json({ content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '추출 실패' }, { status: 500 });
  }
}
