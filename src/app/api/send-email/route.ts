import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { content, url, email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: '이메일 주소가 필요합니다.' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail', // 예시로 Gmail 사용
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let message;
  if (Array.isArray(content)) {
    message = content.map(item => `${item.selector}: ${item.content}`).join('\n');
  } else {
    message = content;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '크롤링 알림',
      text: `공지사항: ${message}\nURL: ${url}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '이메일 전송 실패' }, { status: 500 });
  }
}
