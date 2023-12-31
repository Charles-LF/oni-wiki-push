import { Context, Schema, Logger } from "koishi";
import { listen } from "./listen";

export const name = "oni-wiki-push";
const inject = ["database"];

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
  sleep: Schema.number().description("休眠时间").default(30000),
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
  ctx.command("s").action(({ session }) => {
    logger.info("s");

    return session.channelId;
  });
}
