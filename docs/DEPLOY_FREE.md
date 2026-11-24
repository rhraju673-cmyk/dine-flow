# DineFlow free te live kora (Render + Neon)

Ei guide follow korle DineFlow internet e live thakbe — apnar PC off thakleo.

| Ki | Kothay | Khoroch |
| --- | --- | --- |
| Website + server | **Render** (render.com) | Free |
| Database (PostgreSQL) | **Neon** (neon.tech) | Free |
| Code | **GitHub** (already ache) | Free |

> Free plan er niyom company gulo bodlate pare. Sign up korar somoy oder pricing page e ekbar dekhe niben.

---

## Free plan er limitation (age jene rakhun)

- **Render free server ghumiye pore:** 15 minute keu na dhukle server "sleep" e chole jay. Porer jon dhukle prothom bar khulte **~1 minute** lagte pare. Tarpor abar druto chole.
- **Neon free database:** choto (kichu GB porjonto), kintu data mushe jay na. Shuru korar jonno jotheshto.
- Real restaurant customer ashle pore paid plan e jaowa bhalo (Render er shobcheye kom plan e server ghumay na).

---

## Step 1 — Neon e free database banan

1. **https://neon.tech** e jan → **Sign up** (GitHub account diye sign up kora shohoj).
2. Notun **Project** banan:
   - Project name: `dineflow`
   - Postgres version: default jeta ache
   - Region: **Asia Pacific (Singapore)** (Bangladesh er kachhe, tai fast)
3. Project banano hole **Connect** / **Connection string** button chapun.
4. Je link ta dekhabe seta **copy** korun. Dekhte erokom:

   ```
   postgresql://neondb_owner:xxxxxxxx@ep-xxxx-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

   ⚠️ Eita **gopon password** — kauke deben na, GitHub e rakhben na. Shudhu Render e paste korben (Step 3).

---

## Step 2 — Notun file gulo GitHub e upload korun

Deploy er jonno project e kichu notun file jog kora hoyeche (`render.yaml` ityadi). Ogulo `github-upload/update-deploy/` folder e ready kora ache.

1. GitHub e apnar `dine-flow` repo khulun → **Add file → Upload files**.
2. File Explorer e `dineflow\github-upload\update-deploy` folder khulun.
3. **Ctrl + A** → sob tene GitHub er **"Drag files here…"** box e chhere din.
4. **Commit changes** chapun.
5. Repo er main page e **`render.yaml`** file ta dekha jacche kina check korun.

---

## Step 3 — Render e deploy korun

1. **https://render.com** e jan → **Get Started** → **GitHub diye sign up** korun.
2. Render jodi GitHub access chay, **`dine-flow`** repo ta allow korun.
3. Dashboard e **New +** → **Blueprint** chapun.
4. **`dine-flow`** repo select korun → **Connect**.
5. Render nije `render.yaml` porbe ar **dineflow** naame ekta web service dekhabe.
6. **DATABASE_URL** naame ekta ghor chaibe → Step 1 e copy kora **Neon link** ta paste korun.
7. **Apply** / **Deploy Blueprint** chapun.
8. Opekkha korun (prothom build e **5–10 minute** lagte pare). **Logs** e shesh e ei line ta ashbe:

   ```
   🍽️  DineFlow API running on http://localhost:10000  (production)
   ```

   (Render bhitore port 10000 use kore — eta thik ache.)
9. Upore apnar **live URL** dekhabe, erokom: **`https://dineflow-xxxx.onrender.com`** 🎉

Oi link e dhuke **Start Free Trial** diye notun account khule check korun.

> Demo account (`demo@dineflow.local`) live site e **thakbe na** — eta shudhu apnar PC er jonno. Live site e nijer account khule nin.

---

## Pore code bodlale ki hobe?

GitHub e notun code upload (commit) korlei Render **nije theke** abar deploy kore dey (`autoDeploy: true`). Kichu korte hobe na.

---

## (Optional) Server ke jagiye rakha

Free server 15 minute por ghumay. Chaile **https://uptimerobot.com** (free) e ekta monitor banate paren:
- Monitor type: **HTTP(s)**
- URL: `https://dineflow-xxxx.onrender.com/api/health`
- Interval: **5 minute**

Ete server beshirbhag somoy jege thakbe. (Render er free plan e mash e nirdishto ghonta free thake — ekta service er jonno shadharonoto jothesht.)

---

## Kichu bhul hole

| Somossa | Ki korben |
| --- | --- |
| Build fail, log e `DATABASE_URL` / `P1001` / `Can't reach database` | Render → service → **Environment** e `DATABASE_URL` thik ache kina dekhun. Link er shesh e `?sslmode=require` ache kina check korun. |
| Build fail, log e `npm ERR` | Log er shesh 30 line er screenshot amake pathan. |
| Site khulte onek deri | Free server ghumiye chilo — ~1 minute opekkha korun, reload din. |
| "Security token missing or invalid" | Page reload din. |
| Login e `Too many login attempts` | 15 minute opekkha korun. |

## Nijer domain lagate chaile (pore)

Render → service → **Settings → Custom Domains** e `dineflow.com` er moto domain jog korte paren. Domain kinte hobe (bochhore taka lage).
