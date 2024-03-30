# Musics Compose Example

This directory contains a `docker-compose.yml` file that you can customize for your needs.

[Download the file to your computer now](/zsteinkamp/musics/blob/main/compose_example/docker-compose.yml) so that you can modify it.

It will fetch pre-built containers from the Github Container Registry, so the ony thing you need to do is to change the path to your music root directory in the `volumes:` section near the top of the file.

```
volumes:
  prod_musics:
    driver_opts:
      type: none
      ## CHANGE PATH BELOW FOR YOUR ROOT DIRECTORY
      device: '/mnt/shared/musics'
      o: bind
```

You may also want to change the port mapping for the `nginx` service. In the example, it's listening on port `4141`.

```
  nginx:
    image: ghcr.io/zsteinkamp/musics-nginx
    depends_on:
      - web
    ports:
      - '4141:3141'
```

## Start the application

You can then run `docker compose up -d` and it will start a server after pulling the latest images.

```
> docker compose up -d
[+] Running 2/2
 ✔ Container musics-compose-web-1     Created        0.0s
 ✔ Container musics-compose-nginx-1     Created        0.0s
>
```

The application is now running! You can check it out at http://hostname:4141/ (substituting the hostname where you're running these commands).

## Watching logs

To watch what is happening, you can run `docker compose logs -f`. This is just like `tail -f` that you may be familiar with. Press `Ctrl-C` to stop watching the logs.

## Stopping the application

While in the directory with your `docker-compose.yml` file, run:

```
docker compose down
```

The application will take about 10 seconds to stop.
