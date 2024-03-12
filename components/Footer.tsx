import Link from "next/link"

export default function Footer() {
  return (
    <div className="grid grid-cols-2 mt-16">
      <div className="self-start">by <Link href="https://steinkamp.us/">Zack Steinkamp</Link></div>
      <div className="text-right"><Link href="/about">About this site.</Link></div>
    </div>
  )
}
