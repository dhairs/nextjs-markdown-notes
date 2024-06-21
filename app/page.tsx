import { MDXRemote } from "next-mdx-remote/rsc";

export default async function RemoteMdxPage() {
  // MDX text - can be from a local file, database, CMS, fetch, anywhere...
  const res = await fetch(
    "https://api.github.com/repos/dhairs/College-Notes/git/blobs/6b625f35743197edf95a5aefd98e71bb9c257156",
    {
      headers: {
        accept: "application/vnd.github.raw+json",
      },
    }
  );
  const markdown = await res.text();
  return <MDXRemote source={markdown} />;
}
