# Ophthalmology Association Web Application

A modern web application for ophthalmology associations to manage congresses, abstracts, and member profiles.

## Features

- User authentication and profile management
- Abstract submission and review system
- Congress information and registration
- Sponsor management
- Internationalization (i18n) support for multiple languages
- Responsive design with dark/light mode support

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **State Management**: React Query, Context API
- **Styling**: Tailwind CSS, MUI components
- **Forms**: Formik, Yup
- **Animations**: Framer Motion
- **Internationalization**: i18next, react-i18next

## Recent Improvements

### Internationalization (i18n)

- Added support for multiple languages (English, Spanish)
- Created translation files for common UI elements
- Implemented a language switcher component
- Integrated i18n with components for dynamic text translation

### Theme and Styling

- Created a consistent theme configuration
- Improved component styling with better variants and props
- Added dark/light mode support with smooth transitions
- Enhanced UI components with better accessibility and user experience

### Component Modularity

- Refactored UI components to be more reusable and flexible
- Added proper TypeScript typing for all components
- Improved component props to support more use cases
- Added translation support to components

### File Structure

- Organized code into logical directories
- Improved imports and exports
- Created proper provider structure for global state
- Enhanced component organization

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/ophthalmology-association-web.git
cd ophthalmology-association-web
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables

```
# Create a .env.local file with the following variables
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the development server

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
