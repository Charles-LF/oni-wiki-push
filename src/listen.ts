import type { Channel, Context, Dict } from "koishi";
import { logger } from ".";

// 扩展数据库类型
declare module "koishi" {
  interface Tables {
    rss_wiki: Revisions;
  }
}
export interface Revisions {
  id: number;
  title: string;
  user: string;
  comment: string;
  date: string;
  url: string;
  revid: number;
  parentid: number;
}

export async function listen(ctx: Context, rss: string, sleep: number = 30000) {
  // 从fandom获取动态数据,30秒查询一次
  setInterval(async () => {
    // 发请求获取Wiki的最新动态
    let edit: string[] = await ctx.http
      .get(rss, {
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      })
      .then(async (res) => {
        const db_url = "https://klei.vip/oni/cs63ju/zh/wiki/";

        const { pageid, revisions, title } = res.query?.allrevisions[0];
        const { revid, parentid, user, timestamp, comment } = revisions[0];
        const date = new Date(timestamp).toLocaleString();
        return [title, user, comment, date, db_url, revid, parentid];

        // logger.info(`
        //   <缺氧WIKI> 最近更改[ZH] ${title}
        //   编辑人员: ${user}
        //   更改概要: ${comment}
        //   修改时间: ${date}
        //   原文链接: ${db_url}${encodeURI(title)}?diff=${revid}&oldid=${parentid}
        // `);
      })
      .catch(async (err) => {
        logger.error(err);
        return [];
      });
    //查询数据库
    const db_edit = await ctx.database.get("rss_wiki", { id: 1 });
    const [title, user, comment, date, url, revid, parentid] = edit;

    logger.info(edit);
    logger.info(db_edit);

    if (edit[3] != db_edit[0].date) {
      await ctx.database.upsert("rss_wiki", [
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

      const message = `
      <缺氧WIKI> 最近更改[ZH] ${title}
      编辑人员: ${url}
      更改概要: ${comment}
      修改时间: ${date}
      原文链接: ${url}?diff=${revid}&oldid=${parentid}`;

      // ctx.broadcast(["1739915"], message, true);
    }
  }, 10000);
}