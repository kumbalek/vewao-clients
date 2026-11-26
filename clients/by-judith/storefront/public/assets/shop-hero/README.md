# Shop hero clip

The e-shop's hero (`modules/home/components/shop-hero`), cut on 2026-11-25 from
the owner's `content/video.mp4`: H.264, 1920x1080, 25 fps, 7.16 s, 20 Mbit/s,
18 MB, with a near-silent audio track. It is the same shoot as the landing's
frame sequence (`public/assets/landing`).

| File | What | Size |
| --- | --- | --- |
| `hero-wide.mp4` | desktop, 1920x1080, CRF 24, no audio, faststart | 0.75 MB |
| `hero-portrait.mp4` | below 1024px, 3:4 centre crop 720x960, CRF 25 | 0.36 MB |
| `start-*.jpg` | the first frame, shown at once and replaced by the clip | 19–31 KB |
| `end-*.jpg` | the last frame (to camera), for `prefers-reduced-motion` | 19–31 KB |

```sh
SRC=content/video.mp4
ffmpeg -i $SRC -an -c:v libx264 -profile:v high -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart hero-wide.mp4
ffmpeg -i $SRC -an -vf "crop=810:1080:(iw-810)/2:0,scale=720:960" -c:v libx264 -profile:v high -preset slow -crf 25 -pix_fmt yuv420p -movflags +faststart hero-portrait.mp4
ffmpeg -i $SRC -frames:v 1 -q:v 4 start-wide.jpg
ffmpeg -i $SRC -frames:v 1 -vf "crop=810:1080:(iw-810)/2:0,scale=720:960" -q:v 4 start-portrait.jpg
ffmpeg -sseof -0.1 -i $SRC -frames:v 1 -q:v 4 end-wide.jpg
ffmpeg -sseof -0.1 -i $SRC -frames:v 1 -vf "crop=810:1080:(iw-810)/2:0,scale=720:960" -q:v 4 end-portrait.jpg
```

The stills must be cut from the same file as the clips, or the swap jumps.
