# flatland-viewer

Simple web-based game where you guess the number of sides of a Flatland creature.
A polygon with 3-10 sides is rendered on a canvas, and edges farther from the viewer fade into white fog.
Enter your guess and see if you are correct.

## View in a browser (local)

From the project directory, run a small static web server:

```bash
python3 -m http.server 8080
```

Then open:

- http://localhost:8080/

## Host in the cloud (Vercel)

This repo now includes `vercel.json` for static hosting.

1. Push this repo to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Framework preset: **Other**.
4. Build command: leave empty.
5. Output directory: `.` (project root).
6. Click **Deploy**.

After deploy, Vercel will provide a public URL where Flatland is playable in a browser.
