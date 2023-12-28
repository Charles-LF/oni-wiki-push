import { Context, Session } from "koishi";

export async function updateRss(url: string, session: Session, ctx: Context) {
  return ctx.http
    .get(url, {
      headers: {},
    })
    .then((res) => {
      const url = "https://klei.vip/oni/cs63ju/zh/wiki/";
      const { pageid, revisions, title } = res.query?.allrevisions[0];
      const { revid, parentid, user, timestamp, comment } = revisions[0];
      const date = new Date(timestamp).toLocaleString();
      return `
         <缺氧WIKI> 最近更改[ZH] ${title}
         编辑人员: ${user}
         更改概要: ${comment}
         修改时间: ${date}
         原文链接: ${url}${encodeURI(title)}?diff=${revid}&oldid=${parentid}
         `;
    })
    .catch((err) => {
      console.log(err);
      return;
    });
}

// const url1 =
// "https://oxygennotincluded.fandom.com/zh/api.php?action=query&format=json&list=allrevisions&meta=siteinfo&indexpageids=1&exportnowrap=1&iwurl=1&continue=&titles=%E9%A6%96%E9%A1%B5";
// // const url = "";
// ctx.http
// .get(url1, {
//   headers: {
//     "User-Agent":
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864",
//     "Content-Type": "application/json",
//   },
// })
// .then((res) => {
//   const url = "https://klei.vip/oni/cs63ju/zh/wiki/";
//   const { pageid, revisions, title } = res.query?.allrevisions[0];
//   const { revid, parentid, user, timestamp, comment } = revisions[0];
//   const date = new Date(timestamp).toLocaleString();
//   logger.info(date);

//   logger.info(`
// <缺氧WIKI> 最近更改[ZH] ${title}
// 编辑人员: ${user}
// 更改概要: ${comment}
// 修改时间: ${date}
// 原文链接: ${url}${encodeURI(title)}?diff=${revid}&oldid=${parentid}
// `);
// })
// .catch((err) => {
//   logger.error(err);
// });
