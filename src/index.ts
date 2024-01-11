import { Context, Schema } from "koishi";
import { listen } from "./listen";
import os from "os";
import * as puppeteer from "koishi-plugin-puppeteer";

export const name = "oni-wiki-push";
const inject = ["database", "puppeteer"];

export interface Config {
  rss: string;
  url: string;
  sleep: number;
  botToken: string;
  botId: string;
  channelId: string;
}

export const Config: Schema<Config> = Schema.object({
  rss: Schema.string().default("").description("订阅地址"),
  url: Schema.string(),
  sleep: Schema.number().description("休眠时间").default(300000),
  botId: Schema.string(),
  channelId: Schema.string(),
  botToken: Schema.string(),
});

export function apply(ctx: Context, config: Config) {
  // 创建动态的数据库
  ctx.model.extend(
    "rss_wiki",
    {
      id: "integer",
      title: "text",
      user: "text",
      comment: "text",
      date: "text",
      url: "text",
      revid: "integer",
      parentid: "integer",
    },
    {
      unique: ["id"],
    }
  );

  const logger = ctx.logger("oni-wiki-push");

  //获取最后一条订阅
  ctx.command("lasted").action(async ({ session }) => {
    const data = await ctx.database.get("rss_wiki", { id: 1 });
    logger.info(data);
    const { title, user, comment, date, url, revid, parentid } = { ...data[0] };
    const message = `《缺氧WIKI》最近更改[ZH] ${title}\n编辑人员: ${user}\n更改概要: ${comment}\n修改时间: ${date}\n原文链接: ${url}?diff=${revid}&oldid=${parentid}
    `;
    return message;
  });

  // 开启订阅
  ctx.command("startrss").action(async ({ session }) => {
    session.send("本轮监听开始...");
    setInterval(async () => {
      const data = await ctx.database.get("rss_wiki", { id: 1 });
      const Data2 = await ctx.database.get("rss_wiki", { id: 2 });
      const { title, user, comment, date, url, revid, parentid } = Data2[0];
      const Date = data[0]?.date;
      const newDate = Data2[0]?.date;
      if (Date !== newDate) {
        ctx.database.upsert("rss_wiki", [
          {
            id: 1,
            title: title,
            user: user,
            comment: comment,
            date: date,
            url: url,
            revid: Number(revid),
            parentid: Number(parentid),
          },
        ]);
        await screenShot(title);
        await sendMessage(
          config.channelId,
          config.botId,
          config.botToken,
          title,
          user,
          comment,
          date,
          url,
          revid.toString(),
          parentid.toString()
        );
      }
    }, 5000);
  });

  // 拉取订阅并推送到数据库
  listen(ctx, config.rss, config.sleep);

  // 发送主动消息
  async function sendMessage(
    channelId: string,
    botId: string,
    botToken: string,
    title: string,
    user: string,
    comment: string,
    date: string,
    url: string,
    revid: string,
    parentid: string
  ) {
    const message = `  缺氧WIKI 最近更改[ZH] ${title}
    编辑人员: ${user}
    更改概要: ${comment}
    修改时间: ${date}
    原文链接: ${url}${title}?diff=${revid}&oldid=${parentid}\n更改页面已尝试写入本地缓存图库...`;
    await ctx.http
      .post(
        `https://api.sgroup.qq.com/channels/${channelId}/messages`,
        {
          content: message,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bot ${botId}.${botToken}`,
          },
        }
      )
      .then((res) => {
        logger.info(res);
      });
  }
  async function screenShot(title: string) {
    const page = await ctx.puppeteer.page();
    await page.goto("https://oxygennotincluded.fandom.com/zh/wiki/" + title, {
      // waitUntil: "networkidle2",
      timeout: 0,
    });
    // 添加元素框距离
    await page.addStyleTag({
      content: "#mw-content-text{padding: 40px}",
    });
    const selector = await page.$("#mw-content-text");
    await selector
      .screenshot({
        type: "jpeg",
        quality: 65,
        path: `${os.homedir()}/wikiImg/${title
          .replace(/\//g, "-")
          .replace(/:/g, "-")
          .replace(/'/g, "-")}.jpeg`,
      })
      .then(async () => {
        logger.info(`截图成功: ${title}`);
      })
      .catch(async (err) => {
        logger.error(err);
      })
      .finally(async () => {
        await page.close();
      });
  }
}
