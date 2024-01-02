import { Context, Schema, Logger, Bot } from "koishi";
import { listen } from "./listen";

export const name = "oni-wiki-push";
export const logger = new Logger(name);
const inject = ["database"];

export interface Config {
  rss: string;
  url: string;
  sleep: number;
  botId: string;
  channelId: string;
}

export const Config: Schema<Config> = Schema.object({
  rss: Schema.string().default("").description("订阅地址"),
  url: Schema.string(),
  sleep: Schema.number().description("休眠时间").default(30000),
  botId: Schema.string(),
  channelId: Schema.string(),
});

export function apply(ctx: Context, config: Config) {
  // 创建动态的数据库
  ctx.database.extend(
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

  const logger = ctx.logger("test");

  // 比对数据库中的信息
  ctx.bots.map((bot: Bot) => {
    logger.info(bot);
    if (bot.selfId === config.botId) {
      bot.sendMessage(config.channelId, "启动成功", "1399749824819376382");
    }
  });

  // listen(ctx, config.rss, config.sleep);

  ctx.command("t").action(async ({ session }) => {
    const data = await ctx.database.get("rss_wiki", { id: 1 });
    logger.info(data);
    const { title, user, comment, date, url, revid, parentid } = { ...data[0] };
    const message = `《缺氧WIKI》最近更改[ZH] ${title}\n编辑人员: ${user}\n更改概要: ${comment}\n修改时间: ${date}\n原文链接: ${url}?diff=${revid}&oldid=${parentid}
    `;
    return message;
  });
}
