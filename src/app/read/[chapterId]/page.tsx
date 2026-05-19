import StarterShell from "@/components/starter-shell";

export default function ReaderPage({
  params,
}: {
  params: { chapterId: string };
}) {
  return <StarterShell chapterId={params.chapterId} route="reader" />;
}
