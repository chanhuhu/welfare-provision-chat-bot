import {
  Client,
  ClientConfig,
  TextMessage,
  WebhookEvent,
  validateSignature,
} from '@line/bot-sdk';
import * as functions from 'firebase-functions';

const config: ClientConfig = {
  channelAccessToken: functions.config().env.accesstoken,
  channelSecret: functions.config().env.secret,
};

const client = new Client(config);

export const webhook = functions.https.onRequest(async (req, res) => {
  if (
    config.channelSecret &&
    !validateSignature(
      req.body,
      config.channelSecret,
      req.headers['x-line-signature'] as string
    )
  ) {
    res.status(401).send('Unauthorized');
  }
  const events: WebhookEvent[] = req.body.events;
  const results = Promise.all(
    // @ts-ignore
    events.map(async (event: WebhookEvent) => {
      switch (event.type) {
        case 'message':
          if (event.message.type !== 'text') {
            return Promise.resolve(null);
          } else if (
            event.message.type === 'text' &&
            event.message.text.includes('กองทุนการออมแห่งชาติ')
          ) {
            const payload: TextMessage = {
              type: 'text',
              text:
                'เป็นการออมภาคสมัครใจที่รัฐจัดให้ สามารถมีบำเหน็จบำนาญให้ในยามเกษียณจาก เงินออมสะสมของตนเองและเงินที่รัฐสมทบเพิ่ม โดยมีเป้าหมายสำคัญในการลดความเลื่อมล้ำ ในสังคมสร้างหลักประกันที่มั่นคงในชีวิตของ ประชากร หลังจากการสิ้นการเป็นสมาชิก การจ่ายเงิน เงินออม ตั้งแต่ 50 บาทขึ้นไป ต่อปี รัฐจ่ายเงินสมทบเป็นร้อยละของเงินออม ตามอายุของสมาชิก ',
            };
            return await client.replyMessage(event.replyToken, payload);
          } else if (
            event.message.type === 'text' &&
            event.message.text.includes('ติดต่อสอบถามข้อมูลเพิ่มเติม')
          ) {
            const payload: TextMessage = {
              type: 'text',
              text: 'กำนัน: 093-xxxxxxxx',
            };
            return await client.replyMessage(event.replyToken, payload);
          } else if (event.message.type === 'text') {
            const payload: TextMessage = {
              type: 'text',
              text: event.message.text,
            };
            return await client.replyMessage(event.replyToken, payload);
          }
          break;
        default:
          res.send(`Not Implement ${event.type}`);
          return Promise.resolve(null);
          break;
      }
    })
  );
  res.status(200).json({ status: 'success', results });
});
