import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { content, url } = await request.json();

  const apiKey = process.env.KAKAO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    let message;
    if (Array.isArray(content)) {
      message = content.map(item => `${item.selector}: ${item.content}`).join('\n');
    } else {
      message = content;
    }

    await axios.post('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
      template_object: {
        object_type: 'text',
        text: `공지사항: ${message}`,
        link: { web_url: url },
      },
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '전송 실패' }, { status: 500 });
  }
}
