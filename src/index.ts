import { Context, Schema, Logger } from "koishi";
import { listen } from "./listen";

export const name = "oni-wiki-push";
const inject = ["database"];

export interface Config {
  rss: string;
  url: string;
  sleep: number;
  botId: string;
  botToken: string;
  channelId: string;
}

export const Config: Schema<Config> = Schema.object({
  rss: Schema.string().default("").description("订阅地址"),
  url: Schema.string(),
  sleep: Schema.number().description("休眠时间").default(1000),
  botId: Schema.string(),
  botToken: Schema.string(),
  channelId: Schema.string(),
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
  ctx.command("startrss").action(async ({ session }) => {
    session.send("本轮监听开始。。。");
    setInterval(async (session) => {
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
        sendMessage(
          config.channelId,
          config.botId,
          config.botToken,
          title,
          user,
          comment,
          date,
          url,
          revid,
          parentid
        );
      }
    }, 10000);
  });

  // 发送主动消息到频道
  async function sendMessage(
    channelId: string,
    botId: string,
    botToken: string,
    title: string,
    user: string,
    comment: string,
    date: string,
    url: string,
    revid: number,
    parentid: number
  ) {
    const message = `  缺氧WIKI 最近更改[ZH] ${title}
    编辑人员: ${user}
    更改概要: ${comment}
    修改时间: ${date}
    原文链接: ${url}?diff=${revid}&oldid=${parentid}`;
    ctx.http
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

  //从fandom获取订阅并推送到数据库
  listen(ctx, config.rss, config.sleep);
}
