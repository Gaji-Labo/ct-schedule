import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <p>not found</p>
      <Link href="/" className="underline">
        トップに戻る
      </Link>
    </div>
  );
}
