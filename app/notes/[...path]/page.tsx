import { GitHubRepoTree } from "@/interfaces/github";
import { getAllNotes, getNoteByPath, getNotePaths } from "@/lib/api";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Suspense } from "react";
import { Metadata, ResolvingMetadata } from "next";
import { redirect, notFound } from "next/navigation";

type Props = {
  params: { path: string[] };
};

function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ));
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ));

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

const components = {
  Table,
};

export async function generateStaticParams() {
  const notes = await getNotePaths();

  const resp = [];

  for (let path in notes) {
    resp.push({ params: { path: path } });
  }
  //   return notes.map((note) => ({ params: { path: note.path } }));

  return resp;
}

export default async function RemoteMdxPage({
  params,
}: {
  params: { path: string[]; url: string };
}) {
  console.log(decodeURI(params.path.join("/")));
  const note = await getNoteByPath(decodeURI(params.path.join("/")));
  //   console.log(note._html);

  if (!note) {
    notFound();
  }
  return (
    <article className="prose lg:prose-lg">
      <Suspense fallback={<>Loading...</>}>
        {/* <MDXRemote source={note.content} components={{ ...components }} /> */}
        <div dangerouslySetInnerHTML={{ __html: note._html }} />
      </Suspense>
    </article>
  );
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const path = params.path;

  const note = await getNoteByPath(decodeURI(path.join("/")));

  if (!note) return;

  return {
    title: note.data?.title || "Notes - Dhairya Gupta",
  };
}
