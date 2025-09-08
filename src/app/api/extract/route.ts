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
    const content = await page.$eval(selector, el => el.textContent);
    await browser.close();

    return NextResponse.json({ content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '추출 실패' }, { status: 500 });
  }
}
