import { getNotes } from "./actions";

export default async function Home() {
  const allNotes = await getNotes();
  return (
    <div>
      <h1>DevNotes</h1>
      <pre>{JSON.stringify(allNotes, null, 2)}</pre>
    </div>
  );
}