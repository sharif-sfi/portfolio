# Shariful Islam — Portfolio Website

A responsive personal portfolio website for Shariful Islam, built with separate HTML, CSS and JavaScript files.

## Project structure

```text
shariful-portfolio/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── main.js
├── Certification/
│   └── (certificate images shown in the slider)
└── assets/
    ├── sharif-logo.png
    ├── shariful-islam.png
    └── Shariful-Islam-CV.pdf
```

## Certifications slider

Certificates live in the `Certification/` folder. To add one, copy a `<li class="cert-slide">` block inside the section marked `CERTIFICATIONS SLIDER — START/END` in `index.html`, change its `data-index`, image, title and description. The slider and pop-up pick it up automatically.

## Run locally

Open `index.html` in a browser. No build process is required.

## GitHub Pages

1. Create a public GitHub repository.
2. Upload the contents of this folder.
3. Go to **Settings → Pages**.
4. Select **Deploy from a branch**, choose `main` and `/ (root)`.
5. Save and open the generated GitHub Pages URL.

## CV download

The Hero section's **Download CV** button points to `assets/Shariful-Islam-CV.pdf` and uses the browser download attribute.

## Notes

The portfolio intentionally does not publish highly sensitive CV information such as NID number, parents' names, or private referee contact details.
