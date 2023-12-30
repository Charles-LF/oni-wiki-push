import { Context, Schema, Session, Logger, Bot } from "koishi";
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
  ctx.database.upsert("rss_wiki", [
    {
      id: 1,
      title: "test",
    },
  ]);
  listen(ctx, config.rss, config.sleep);
  const logger = ctx.logger("test");

  //获取左后一条订阅
  ctx.command("t").action(async ({ session }) => {
    const data = await ctx.database.get("rss_wiki", { id: 1 });
    const [title, user, comment, date, url, revid, parentid] = data;
    const message = `
      <缺氧WIKI> 最近更改[ZH] ${title}
       编辑人员: ${user}
       更改概要: ${comment}
       修改时间: ${data}
       原文链接: ${url}?diff=${revid}&oldid=${parentid}
    `;
    return message;
  });
  ctx.command("s").action(({ session }) => {
    logger.info("s");
    // ctx.http.post("", {});

    // ctx.broadcast(["1739915"], "t", true);

    return "hhhh";
  });
}
