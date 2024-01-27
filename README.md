# musics

This is a filesystem-driven web application intended to show an interface for
browsing directory hierarchies of audio files.

I developed it so that I could have a live, public view into the directory where
I render audio files from my music making projects. This lets me listen to any
in-progress song anywhere in the world, served from my home network at
https://musics.steinkamp.us/.

You can use this same software for your music folder and keep within your own
private home network, or make it public for the world to enjoy.

| ![Screenshot One](/public/screenshot1.png) | ![Screenshot Two](/public/screenshot2.png) |
| ------------------------------------------ | :----------------------------------------- |

## Getting Started

First, edit the `docker-compose.yml` file and map the `musics` volume to where
your music directory lives. The checked-in example in the `main` branch is what
I use to connect to an NFS volume on my network.

Then, run:

```bash
make prod
```

This will build and run the container with your music directory mounted read-only.

Open [http://localhost:3141](http://localhost:3141) with your browser to see the result.

## `album.yml` Files

A directory may contain a special metadata file called `album.yml`. This file
lets you customize how that directory is presented in the application.

An example of `album.yml` is:

```yaml
title: On The Scene
cover: album.jpg
tracks:
  - prefix: mirrorImage
    title: Mirror Image
  - prefix: timeAlwaysMoving
    title: Time Always Moving
  - prefix: purityOfEssence
    title: Purity of Essence
  - prefix: onTheScene
    title: On The Scene
```

This example shows how to override the `title` displayed on the page, the
filename of a `cover` image to display at the top of the page, as well as a list
of `tracks` in the order you prefer, with a custom title to display for each
track.

The `album.yml` file may contain some or all of the above customizations, so
this is a perfectly valid file too:

```yaml
title: On The Scene
```

## Development

This project has a Visual Studio Code `.devcontainer` defined, so the best way
to work on this is to use that facility of VSCode ("Reopen in Container").

The development server will be available at [http://localhost:3142/](http://localhost:3142/).

## Contributing

If you have an idea to improve this application, please open an issue in this
repo, or send me an email at [zack@steinkamp.us](mailto:zack@steinkamp.us), or
fork this repo and open a pull request. Let's make software better together!
