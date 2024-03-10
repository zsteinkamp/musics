import Link from "next/link"

export default function AboutPage() {
  return (
    <div>
      <h1 className="text-4xl mb-4 font-header text-headertext-light dark:text-headertext-dark">Aboot This Site</h1>
      <p className="mb-4">
        One of my hobbies is music-making with the computer in Ableton Live. Part of the workflow is to render songs as .wav files either to listen elsewhere or to submit for publishing to services like Apple Music or Spotify.
      </p>
      <p className="mb-4">
        In order to listen elsewhere, normally you would need to copy the .wav file to your phone, or upload it to a service like SoundCloud or Bandcamp. This works, but it&apos;s an extra step and extra steps are a drag!
      </p>
      <p className="mb-4">
        I wrote `musics` to serve my .wav file export directory over the Internet, mostly so that I could listen to works-in-progress in the car, in different headphones, on bluetooth speakers, etc.
      </p>
      <p className="mb-4">
        When I&apos;m working on a song, I might export 30 or more versions before I&apos;m satisfied. I have a naming convention for the versions (name-00.wav, name-01.wav, ...), and `musics` embraces that. It will play the newest version by default, but you can also A/B test different versions in the browser.
      </p>
      <h2 className="text-2xl mb-4 font-header text-headertext-light dark:text-headertext-dark">
        Contributing
      </h2>
      <p className="mb-4">
        This is open-source software. <Link href="https://github.com/zsteinkamp/musics">Please check it out</Link>, and if you have improvements to share, then please <Link href="https://github.com/zsteinkamp/musics/pulls">open a pull request</Link>. Thanks!
      </p>
    </div>
  )
}