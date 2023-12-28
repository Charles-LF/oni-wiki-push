import { Context, Schema, Session } from "koishi";
import { updateRss } from "./rss";

export const name = "oni-wiki-push";
const inject = ["database"];

declare module "koishi" {
  interface Tables {
    wiki_push: Revisions;
  }
  interface Channel {
    rss_wiki: string[];
  }
  interface Modules {
    rss_wiki: typeof import(".");
  }
}

export interface Revisions {
  id: number;
  title: string;
  user: string;
  comment: string;
  date: string;
  url: string;
}

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export function apply(ctx: Context) {
  const logger = ctx.logger("test");

  // 添加数据库
  ctx.model.extend("channel", {
    rss_wiki: "list",
  });

  ctx.database.extend("wiki_push", {
    id: "integer",
    title: "string",
    user: "string",
    comment: "string",
    date: "string",
    url: "string",
  });

  ctx
    .guild()
    .command("wikirss <url:text>", "加入wiki订阅")
    .action(async ({ session, options }, url) => {
      const feedMap: Record<string, Set<string>> = {};
      const source = new Set("sds");
      feedMap.sds = source;
      const message = "这是一段测试信息";
      ctx.broadcast([...feedMap[1]], message);
    });
}
