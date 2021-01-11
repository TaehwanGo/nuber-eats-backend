import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interfaces';
import got from 'got';
import * as FormData from 'form-data'; // TypeError: form_data_1.default is not a constructor : * as 추가함

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions, // private readonly configService: ConfigService // 이것만 해도 app.module에서 forRoot로 PRIVATE_KEY를 넘겨줄 필요는 없었으나 연습을 위해 만들어 봄
  ) {
    // console.log('MailService options:', options); // this.options
    // this.sendEmail('testing', 'test', 'gth1123@naver.com'); // just for test // it's not working yet
  }

  private async sendEmail(subject: string, content: string, userEmail: string) {
    // curl을 이용 : 콘솔에서 API를 이용하기 위한 것
    // nodejs엔 frontend의 fetch가 없음 - npm i got 사용
    const form = new FormData();
    form.append('from', `Excited User <mailgun@${this.options.domain}>`);
    form.append('to', userEmail);
    form.append('subject', subject);
    form.append('text', content);

    const response = await got(
      `https://api.mailgun.net/v3/${this.options.domain}/messages`,
      {
        https: {
          rejectUnauthorized: false, // 나중에 prod 에선 삭제 해야 됨
        },
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`, // 'api:YOUR_API_KEY' 를 base64로 encoding해서 header에 사용할 것임
        },
        body: form,
        // body: 'testing body text',
      },
    );
    // console.log(
    //   `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString('base64')}`,
    // );
    console.log('mailgun response', response.body);
  }
}
