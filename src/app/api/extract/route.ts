import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { NextRequest, NextResponse } from 'next/server';

puppeteer.use(StealthPlugin());

export async function POST(request: NextRequest) {
  const { url, selectors } = await request.json();

  if (!url || !selectors) {
    return NextResponse.json({ error: 'URL과 셀렉터가 필요합니다.' }, { status: 400 });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    const page = await browser.newPage();

    // 사용자 정의 헤더 설정
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });

    // 특정 요청 차단
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      const url = request.url();
      if (
        resourceType === 'image' ||
        resourceType === 'media' ||
        resourceType === 'font' ||
        url.includes('google-analytics.com') ||
        url.includes('googletagmanager.com') ||
        url.includes('facebook.com') ||
        url.includes('doubleclick.net')
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // 랜덤 지연
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 3000) + 1000));

    await page.goto(url, { waitUntil: 'networkidle2' });

    // 추가 지연
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 2000) + 500));

    const content: { [key: string]: string } = {};
    for (const [type, sel] of Object.entries(selectors as { [key: string]: string })) {
      if (sel) {
        const selectorList = sel.split(',').map((s: string) => s.trim()).filter((s: string) => s);
        const texts: string[] = [];
        for (const selector of selectorList) {
          try {
            const text = await page.$eval(selector, el => el.textContent?.trim() || '');
            if (text) texts.push(text);
          } catch (e) {
            // 무시
          }
        }
        content[type] = texts.join('\n');
      }
    }

    await browser.close();

    return NextResponse.json({ content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '추출 실패' }, { status: 500 });
  }
}
