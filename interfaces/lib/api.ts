import { GitHubRepoTree } from "@/interfaces/github";
import { Note } from "@/interfaces/note";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";

const baseApiUrl = "https://api.github.com/repos/dhairs/exported-notes/git";

const paths: { [key: string]: string } = {};

export async function getNotePaths() {
  if (Object.keys(paths).length < 1) {
    const data = (await fetch(
      "https://api.github.com/repos/dhairs/Exported-Notes/git/trees/main?recursive=1",
      {
        headers: {
          Authorization: `Bearer ${process.env.GH_PAT}`,
        },
      }
    ).then((res) => res.json())) as GitHubRepoTree;

    for (let i = 0; i < data.tree.length; i++) {
      paths[data.tree[i].path.toLowerCase()] = data.tree[i].url;
    }
  }

  return paths;
}

export async function getNoteByPath(path: string) {
  if (Object.keys(paths).length < 1) {
    await getNotePaths();
  }

  const intermediary = `${path.toLowerCase()}.md`;
  const realPath = path.toLowerCase().replace(/\.md$/, "");

  if (!paths[intermediary]) return;

  const contents = await fetch(paths[intermediary], {
    headers: {
      accept: "application/vnd.github.raw+json",
      Authorization: `Bearer ${process.env.GH_PAT}`,
    },
  });

  const { data, content } = matter(await contents.text());

  const _html = (
    await unified().use(remarkParse).use(html).use(remarkGfm).process(content)
  ).toString();

  return { ...data, path: realPath, content, _html } as Note;
}

export async function getAllNotes() {
  const allPaths = await getNotePaths();

  const notes = [];
  for (let path in allPaths) {
    notes.push(await getNoteByPath(path));
  }

  return notes;
}

export async function getAllLinksInMarkdown(md: string) {
  let regex = /(?=\[(!\[.+?\]\(.+?\)|.+?)]\((https:\/\/[^\)]+)\))/gi;

  let links = [...md.matchAll(regex)].map((m) => ({
    text: m[1],
    link: m[2],
  }));

  return links;
}
