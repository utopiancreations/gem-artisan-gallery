# Gem Artisan Gallery

A professional portfolio website for showcasing handcrafted jewelry and artistic creations.

## Overview

This elegant, responsive website serves as a digital showcase for artisanal jewelry creations. The site features:

- A dynamic homepage with featured works and upcoming events
- An interactive gallery with category filtering
- About page with artist information
- Events calendar for exhibitions and shows
- Contact form for custom inquiries

## Technologies

This project is built with modern web technologies:

- **React** - UI development with functional components and hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend build tool
- **Tailwind CSS** - Utility-first CSS framework for streamlined styling
- **Firebase** - Backend services for data storage, authentication, and hosting
- **shadcn-ui** - UI component library for consistent, accessible interface elements

## Getting Started

### Prerequisites

- Node.js (v18+) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm (v9+)
- Git
- Firebase account (for database and hosting)

### Local Development

```bash
# Clone the repository
git clone https://github.com/utopiancreations/gem-artisan-gallery.git

# Navigate to project directory
cd gem-artisan-gallery

# Install dependencies
npm install

# Set up environment variables
# Create a .env.local file with your Firebase configuration
# See .env.example for required variables

# Start development server
npm run dev
```

The application will be available at http://localhost:5173 (or another port if 5173 is in use).

## Project Structure

```
gem-artisan-gallery/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and Firebase setup
│   ├── pages/         # Page components
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── .env.example       # Example environment variables
├── index.html         # HTML template
├── package.json       # Dependencies and scripts
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json      # TypeScript configuration
└── README.md          # Project documentation
```

## Deployment

This site can be deployed to Firebase Hosting:

```bash
# Build the production version
npm run build

# Deploy to Firebase
npm run deploy
```

You can also deploy to other hosting providers like Vercel, Netlify, or GitHub Pages.

## Features

- **Smooth Animations**: Polished page transitions and loading states
- **Responsive Design**: Optimized viewing experience across all device sizes
- **Firebase Integration**: Real-time database for artwork, events, and contact form submissions
- **SEO Optimized**: Meta tags and structured data for better search engine visibility
- **Accessibility**: WCAG compliant components and keyboard navigation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - jmiller@utopiancreations.one

Project Link: [https://github.com/utopiancreations/gem-artisan-gallery](https://github.com/utopiancreations/gem-artisan-gallery)

---

© 2025 Utopian Creations. All Rights Reserved.