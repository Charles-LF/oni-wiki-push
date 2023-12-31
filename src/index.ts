import { Context, Schema, Logger, Bot } from "koishi";
import { listen } from "./listen";

export const name = "oni-wiki-push";
export const logger = new Logger(name);
const inject = ["database"];

export interface Config {
  rss: string;
  url: string;
  sleep: number;
}

export const Config: Schema<Config> = Schema.object({
  rss: Schema.string().default("").description("订阅地址"),
  url: Schema.string(),
  sleep: Schema.number().description("休眠时间").default(1000),
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
  // 监听
  // ctx.database.upsert("rss_wiki", [
  //   {
  //     id: 1,
  //     title: "test",
  //   },
  // ]);

  const logger = ctx.logger("test");

  //获取最后一条订阅,并开始订阅
  ctx.command("t").action(async ({ session }) => {
    listen(ctx, config.rss, session, config.sleep);

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
