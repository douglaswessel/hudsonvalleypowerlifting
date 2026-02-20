# Hudson Valley Powerlifting Website

## Deployment Instructions

### Option 1: Netlify (Recommended - Easiest)

**Step 1: Create Netlify Account**
1. Go to [netlify.com](https://netlify.com)
2. Sign up (free)

**Step 2: Deploy Site**
1. Drag the entire `hvpl-site` folder onto Netlify's dashboard
2. Site deploys instantly
3. You'll get a URL like `random-name-12345.netlify.app`

**Step 3: Connect Domain**
1. In Netlify dashboard → Domain Settings
2. Click "Add custom domain"
3. Enter `hvpowerlifting.com`
4. Follow DNS instructions (update nameservers at your registrar)

**DNS Records to Add:**
```
Type: CNAME
Name: www
Value: [your-site].netlify.app

Type: A (for root domain)
Value: (Netlify provides this)
```

---

### Option 2: Vercel (Also Free)

**Step 1: Create Vercel Account**
1. Go to [vercel.com](https://vercel.com)
2. Sign up

**Step 2: Deploy**
1. Click "Add New Project"
2. Drag folder or connect GitHub
3. Deploy

**Step 3: Connect Domain**
Same as Netlify - update nameservers in Vercel dashboard

---

### Option 3: GitHub Pages (Free, Requires GitHub)

**Step 1: Create GitHub Repository**
1. Go to [github.com](https://github.com)
2. Create new repository named `hvpl-website`
3. Upload all files from `hvpl-site` folder

**Step 2: Enable GitHub Pages**
1. Repository Settings → Pages
2. Source: Deploy from branch `main`
3. Save

**Step 3: Connect Domain**
1. Add `CNAME` file with `hvpowerlifting.com` inside
2. Update DNS at registrar:
```
Type: CNAME
Name: www
Value: [username].github.io

Type: A (for root)
Value: 185.199.108.153
```

---

## DNS Migration from Wix

**Where to Update DNS:**
Find where you bought `hvpowerlifting.com` (likely GoDaddy, Namecheap, etc.)

**Migration Steps:**
1. Deploy new site first (test with temp URL)
2. Update DNS records at registrar
3. Wait 24-48 hours for propagation
4. Keep Wix site live during transition
5. Cancel Wix after new site is live

**Testing Before DNS Switch:**
Use the temporary URL (netlify.app or vercel.app) to verify everything works

---

## File Structure

```
hvpl-site/
├── index.html          # Home page
├── members.html        # Memberships & pricing
├── training.html       # Training & coaching
├── equipment.html      # Equipment list
├── contact.html        # Contact & location
├── images/
│   └── HVPL_Logo.png  # Logo
└── README.md          # This file
```

---

## After Deployment

**Add Real Images:**
1. Take photos of gym
2. Replace placeholder backgrounds in HTML
3. Upload updated files

**Add Google Map:**
In `contact.html`, replace map placeholder with:
```html
<iframe 
  src="https://www.google.com/maps/embed?pb=YOUR_EMBED_CODE" 
  width="100%" 
  height="500" 
  style="border:0;" 
  allowfullscreen="" 
  loading="lazy">
</iframe>
```
Get embed code from Google Maps

**Social Media Links:**
Update in footer sections of all pages:
- Facebook: Replace `#` with your Facebook URL
- Instagram: Replace `#` with your Instagram URL

---

## Support

**Need Help?**
- Netlify docs: [docs.netlify.com](https://docs.netlify.com)
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- GitHub Pages: [pages.github.com](https://pages.github.com)

**Common Issues:**
- DNS not updating: Wait 48 hours, clear browser cache
- Images not loading: Check file paths are lowercase
- Form not working: Need backend (use Netlify Forms or Formspree)
