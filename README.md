# 🔐 Personal Portfolio - Hirat Rahman Rahi

Hey! This is my personal portfolio website showcasing my work in cybersecurity, software development, and my journey as a Computer Science & Neuroscience student at Illinois Wesleyan University.

🌐 **Live Site:** [hiratrahi.com](https://hiratrahi.com)

## 📸 Preview

A modern, dark-themed portfolio with a burgundy and red color scheme designed to reflect my focus on offensive security and red team operations.

## 🎯 What's Inside

- **Hero Section** - Introduction with my focus on offensive security
- **About** - My background, education, and what drives me
- **Skills** - Technical skills including binary exploitation, web security, and more
- **Experience** - My internships and work experience
- **Projects** - Security projects I've worked on (CTF challenges, exploitation frameworks, etc.)
- **Contact** - Ways to reach me

## 🛠️ Built With

- **React** - Frontend framework
- **Tailwind CSS** - For styling (with custom burgundy theme)
- **Lucide React** - Icons
- **GitHub Pages** - Source
- **Cloudflare** - Hosting + Deployment platform

## 🎨 Design Choices

- **Burgundy/Red Theme** - Represents power, sophistication, and the "red team" focus in cybersecurity
- **Monospace Font** - Gives that terminal/hacker aesthetic
- **Dark Mode** - Easier on the eyes and fits the security theme
- **Animated Elements** - Floating hex codes and smooth transitions for a modern feel

## 📁 Project Structure

```
portfolio/
├── public/
│   ├── index.html
│   └── favicon.svg
├── src/
│   ├── App.js          # Main portfolio component
│   ├── index.js        # Entry point
│   └── index.css       # Tailwind config
├── package.json
└── tailwind.config.js
```

## 📝 TODO

- [ ] Add a blog section for writeups
- [ ] Include CTF stats/achievements
- [ ] Add resume download functionality

## 📝 How to Add More Projects:
- Just add new objects to the projects array with this format:

```
{
  title: "Your Project Name",
  category: "Category (e.g., Web Security)",
  description: "Short preview description",
  tech: ["Tech1", "Tech2", "Tech3"],
  gradient: "from-red-900 via-burgundy-900 to-black",
  fullDescription: `Full detailed description here.
  
  **You can use:**
  • Bullet points
  • Multiple paragraphs
  
  **Sections** with bold headers`,
  links: [
    { label: "GitHub", url: "https://github.com/..." },
    { label: "Live Demo", url: "https://..." }
  ]
}
```

## How to Commit (since the merge is required)

- Daily workflow (keep update-projects)
 - Start work: sync both branches

```
From your repo root:

git fetch origin

git checkout main
git pull origin main

git checkout update-projects
git pull origin update-projects


This keeps your local branches aligned with GitHub.
```

- Make changes, then commit on update-projects

```
Do your edits (files, _headers, React code, etc.), then:

git status
git add -A
git commit -m "Describe what you changed"
git push

Because you already did git push -u origin update-projects, plain git push works.
```

- When you want it live: create a PR (update-projects → main)

```
On GitHub:

Pull requests → New pull request

base: main

compare: update-projects

Create PR → approvals → merge

check the status: 
git log --oneline origin/main..origin/update-projects
```

## 🎨 Features for Future Projects:

- Add screenshots/images by including an images array
- Add date completed
- Add GitHub stars or metrics
- Add collaborators
- Add status (In Progress, Completed, etc.)

## 🤝 Contributing

This is a personal portfolio, but if you find bugs or have suggestions, feel free to open an issue!

## 📧 Contact

- **Email:** hrahi@iwu.edu
- **LinkedIn:** [linkedin.com/in/hiratrahman](https://linkedin.com/in/hiratrahi)
- **GitHub:** [github.com/hiratinspace](https://github.com/hiratinspace)

## 📄 License

All rights reserved. This is my personal portfolio - feel free to use it as inspiration for your own, but please don't copy it directly. Make it your own!

---

Made with ☕ and late nights by a college student who probably should be studying for exams 😅

**Fun fact:** The floating hex codes in the background are randomly generated on each page load!
