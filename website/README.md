# Patron

An open-source alternative to Patreon, specifically designed for serialized content creators who want to offer early access to their latest releases.

## 🎯 What is Patron?

Patron is a creator-focused platform that enables content creators to monetize their work by providing early access to serialized content. Unlike traditional patronage platforms, Patron is built specifically for creators who produce ongoing series, episodes, chapters, or other sequential content.

![Landing page - Desktop](assets/Landing%20page%20-%20Desktop.png)
![Landing page - Mobile](assets/Landing%20page%20-%20Mobile.png)

### Key Features

- **Early Access Model**: Supporters get preview access to content before public release
- **Serialized Content Focus**: Optimized for creators producing ongoing series
- **Open Source**: Fully transparent and customizable
- **Creator-Centric**: Built with creators' needs in mind
- **Modern Stack**: Fast, reliable, and scalable

## 🛠 Technology Stack

- **Frontend**: [Astro](https://astro.build) - Fast, modern static site generator
- **CMS**: [Keystatic](https://keystatic.com) - Git-based content management
- **CDN**: [Bunny.net](https://bunny.net) - Fast global content delivery
- **Styling**: CSS with modern features
- **TypeScript**: Type-safe development

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- yarn
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/patroninc/patron.git
cd patron/website
```

2. Install dependencies:

```bash
yarn install
```

3. Start the development server:

```bash
yarn dev
```

4. Open [http://localhost:4321](http://localhost:4321) in your browser

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn astro` - Run Astro CLI commands

## 📝 Content Management

This website uses Keystatic as a Git-based CMS, allowing for:

- **Version Control**: All content changes are tracked in Git
- **Collaborative Editing**: Multiple team members can contribute
- **Branch Previews**: Test content changes before going live
- **Local Development**: Edit content locally with full dev tools

### Managing Content

1. Access the admin interface at `/keystatic` (in development)
2. Create and edit content using the visual editor
3. Changes are saved as commits to your repository
4. Deploy changes by pushing to your main branch

## 🌐 Deployment

### Recommended Hosting

- **Static Hosting**: Netlify, Vercel, or GitHub Pages
- **CDN**: Bunny.net for fast global delivery
- **Database**: Consider Planetscale or Supabase for user data

### Environment Setup

Create a `.env` file with your configuration:

```env
# Bunny.net CDN
BUNNY_CDN_URL=your-bunny-cdn-url
BUNNY_API_KEY=your-api-key

# Other configuration
SITE_URL=https://your-domain.com
```

## 🎨 Customization

### Styling

The website uses modern CSS with:

- CSS custom properties for theming
- Responsive design patterns
- Component-scoped styles

### Components

Reusable components are located in `src/components/`:

- Layout components for page structure
- UI components for common elements
- Content-specific components

### Pages

Pages are built with Astro and located in `src/pages/`:

- Static pages for marketing content
- Dynamic pages for creator profiles
- API endpoints for functionality

![Mobile nav](assets/Mobile%20nav.png)

## 🤝 Contributing

We welcome contributions! This is an open-source project built for the creator community.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write semantic HTML
- Use accessible design patterns
- Test across different browsers
- Document new features

## 📋 Roadmap

- [ ] User authentication and profiles
- [ ] Payment processing integration
- [ ] Creator dashboard
- [ ] Subscription management
- [ ] Content scheduling
- [ ] Analytics and insights
- [ ] Mobile app development

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our [wiki](https://github.com/patroninc/patron/wiki)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/patroninc/patron/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/patroninc/patron/discussions)
- **Community**: Follow us for updates and community highlights

## 🙏 Acknowledgments

- Built with [Astro](https://astro.build)
- Content management by [Keystatic](https://keystatic.com)
- CDN powered by [Bunny.net](https://bunny.net)
- Inspired by the creator economy and open-source community

---

**Patron** - Empowering creators with open-source tools for monetizing serialized content.
