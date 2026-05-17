<<<<<<< HEAD
# Class Registration System

A modern Next.js application for managing student class registrations with a beautiful dashboard interface.

## Features

- **Login System**: Secure login page with authentication
- **Dashboard**: Comprehensive dashboard with student information table
- **Left Sidebar Menu**: Navigation menu with expandable sections
- **Student Management**: View, search, and filter student registrations
- **Export Functionality**: Export student data to CSV
- **Responsive Design**: Built with Tailwind CSS and shadcn/ui components
- **Statistics**: Real-time statistics on student registrations

## Tech Stack

- **Next.js 16.2.6** - React framework
- **React 19.2.4** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx      # Dashboard layout with sidebar and header
│   │   └── page.tsx        # Dashboard page with student table
│   ├── login/
│   │   └── page.tsx        # Login page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (redirects to login/dashboard)
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── table.tsx
│   ├── Header.tsx          # Header component with search and user info
│   └── Sidebar.tsx         # Sidebar navigation menu
└── lib/
    ├── data.ts             # Mock student data
    └── utils.ts            # Utility functions
```

## Usage

### Login

1. Navigate to the application
2. Enter any email and password (demo mode)
3. Click "Sign In" to access the dashboard

### Dashboard

- **View Students**: See all registered students in a table
- **Search**: Filter students by name, email, class, or status
- **Pagination**: Navigate through student records
- **Export**: Download student data as CSV file
- **Statistics**: View total students, classes, confirmed, and pending registrations

### Navigation

- **Overview**: Main dashboard view
- **Leaderboard**: Student rankings
- **Spreadsheets**: Data management
- **Event**: Event schedules and transaction history
- **Administration**: Admin settings
- **Schedule**: Class schedules
- **Messages**: Communication
- **Library**: Resources
- **Settings**: Application settings
- **Support**: Help and support

## Customization

### Modify Student Data

Edit `src/lib/data.ts` to add or modify student information:

```typescript
export const students: Student[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Corp',
    className: 'Introduction to React',
    instructor: 'Sarah Johnson',
    schedule: 'Mon/Wed 10:00 AM - 12:00 PM',
    registeredDate: '2024-01-20',
    status: 'confirmed',
  },
  // Add more students...
];
```

### Add New UI Components

The project uses shadcn/ui components. To add new components:

1. Visit [shadcn/ui documentation](https://ui.shadcn.com/)
2. Copy component code to `src/components/ui/`
3. Import and use in your pages

## Deployment

### Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
vercel deploy
```

### Other Platforms

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new pages in `src/app/`
2. Add components in `src/components/`
3. Update mock data in `src/lib/data.ts`
4. Follow the existing component patterns

## License

This project is for educational purposes.

## Support

For issues or questions, please refer to the project documentation or contact the development team.
=======
# Register-Class
>>>>>>> 105646845af1cf685caa0fc85960c01f92ec6713
