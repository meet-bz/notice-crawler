import { chromium } from 'playwright';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { url, selector } = await request.json();

  if (!url || !selector) {
    return NextResponse.json({ error: 'URL과 셀렉터가 필요합니다.' }, { status: 400 });
  }

  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });

    let content;
    if (Array.isArray(selector)) {
      // 여러 셀렉터 처리
      const contents = [];
      for (const sel of selector) {
        try {
          const text = await page.locator(sel).textContent();
          contents.push({ selector: sel, content: text });
        } catch (e) {
          contents.push({ selector: sel, content: null });
        }
      }
      content = contents;
    } else {
      // 단일 셀렉터
      content = await page.locator(selector).textContent();
    }

    await browser.close();

    return NextResponse.json({ content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '추출 실패' }, { status: 500 });
  }
}
