# Trip Planner Frontend - Hotel & Travel Booking Platform

A modern, responsive web application for users to discover hotels, plan trips, and book accommodations and travel options. Built with Next.js, React, Tailwind CSS, and Google Maps integration.

## Overview

Trip Planner Frontend is a customer-facing application that enables users to:
- Browse and search hotels by location, price, and amenities
- View detailed hotel information with maps and images
- Book hotel rooms with date and guest selection
- Plan multi-leg trips with route alternatives
- Search and compare travel options (flights, trains, buses)
- Manage their profile and booking history
- Authenticate securely with JWT-based login

This is a full-featured Next.js application with server-side rendering, client-side interactivity, and seamless integration with the backend API.

## Features

### Hotel Discovery
- Browse all available hotels with rich cards
- Filter by city, minimum rating, and featured status
- Sort by creation date, rating, or custom criteria
- Real-time pagination (20 items per page)
- Search by hotel name
- Hotel distance calculation from user location

### Hotel Details
- Comprehensive hotel information page
- Image gallery with optimized loading
- Location display with MapTiler integration
- Amenities and facilities listing
- Guest reviews and ratings
- Available rooms inventory

### Room Management
- Browse rooms for a specific hotel
- Filter by room type, price, capacity, availability
- Date-based room filtering (check-in/check-out)
- Room details with pricing and amenities
- Individual room detail pages
- Real-time booking status

### Hotel Booking
- Room booking modal with date and guest selection
- Check-in date picker
- Number of days selection
- Guest count validation (1-10)
- Special requests input
- Razorpay payment integration
- Booking confirmation and success overlay

### Trip Planning
- Interactive map-based trip planning
- Location input by place name or map tap
- Current location auto-fill option
- Multiple route alternatives (fastest, shortest, manual)
- Route distance and duration display
- Live route polylines on map
- Trip details input (duration, travel mode, notes)
- Cost estimation from AI service
- Trip creation with route data

### Nearby Hotels
- Geolocation-based hotel search
- Radius-based filtering (5km by default)
- Live user location tracking
- Interactive map with hotel markers
- Distance display for each hotel
- Quick booking access

### User Authentication
- User registration with email validation
- Email and password login
- Password reset functionality
- User profile viewing and editing
- Session persistence with JWT tokens
- Protected routes for logged-in users

### Navigation
- Responsive header with mobile menu
- Dropdown menus for hotel and transport options
- User profile quick access
- Logout functionality
- Deep linking support

## Technology Stack

### Frontend Framework
- **Next.js** 14+ (React app router, server/client components)
- **React** 18+ (UI library)

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Next.js Image** - Optimized image component

### Maps & Location
- **Google Maps API** - Route planning, geocoding, directions
- **MapTiler SDK** - Hotel detail map rendering
- **Geolocation API** - User location detection

### Authentication & State
- **Context API** (AuthContext for user management)
- **LocalStorage** (token and session persistence)
- **JWT** (bearer token authentication)

### API Integration
- Custom apiClient (axios-like HTTP wrapper)
- RESTful communication with backend
- Error handling and response normalization

### Utilities
- **clsx** - Conditional classname utility
- **tailwind-merge** - Tailwind CSS conflict resolution

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend API running at NEXT_PUBLIC_API_BASE_URL
- Google Maps API key with Directions and Geocoding APIs enabled
- MapTiler API key for hotel detail maps

### 1. Install Dependencies
`
cd trip_planner-hotel_booking-
npm install
`

### 2. Configure Environment Variables

Create a .env.local file in the project root:

`
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_MAPTILER_API_KEY=your_maptiler_api_key
`

### 3. Run Development Server
`
npm run dev
`

Open http://localhost:3000 in your browser.

### 4. Build for Production
`
npm run build
npm start
`

## Environment Variables

| Variable | Purpose |
|----------|---------|
| NEXT_PUBLIC_API_BASE_URL | Backend API endpoint for all HTTP requests |
| NEXT_PUBLIC_GOOGLE_MAPS_API_KEY | Google Maps API key for routes, geocoding, directions |
| NEXT_PUBLIC_MAPTILER_API_KEY | MapTiler API key for hotel detail maps |

## Authentication

### Login Flow
1. Navigate to /login
2. Enter email and password
3. Receive JWT token stored in localStorage
4. Automatically redirected to home page
5. Protected routes accessible with valid token

### Registration Flow
1. Navigate to /signup
2. Provide name, email, password
3. Account created, JWT token issued
4. Redirected to home page
5. Can proceed to booking

### Session Management
- JWT tokens stored in localStorage under authToken
- User data cached in localStorage
- Automatic token expiration detection
- Logout clears all auth data
- Protected routes redirect unauthenticated users to /login

### Password Recovery
- Navigate to login page
- Click \"Forgot Password\"
- Enter email address
- Receive password reset link via email
- Follow link and create new password

## Directory Structure

`
src/
├── app/
│   ├── globals.css - Global styles
│   ├── layout.js - Root layout
│   ├── page.js - Home page
│   ├── bookings/ - User bookings page
│   ├── hotels/ - Hotel listing and details
│   ├── login/ - User authentication
│   ├── payments/ - Payment and checkout
│   ├── reviews/ - Review management
│   └── users/ - User profile pages
├── components/
│   ├── HotelMapPicker.js - Google Maps integration
│   ├── Modal.js - Booking modal
│   ├── Card.js - Hotel card display
│   ├── Navbar.js - Navigation header
│   ├── LoadingSpinner.js - Loading states
│   └── [other reusable components]
├── context/
│   └── AuthContext.js - Global user state
├── hooks/
│   ├── useBookings.js - Hotel booking operations
│   ├── useHotels.js - Hotel data management
│   ├── usePayments.js - Payment operations
│   └── [other custom hooks]
└── lib/
    ├── api.js - API client wrapper
    └── utils.js - Utility functions
`

## Booking Flow

1. User browses hotels
2. Selects hotel and clicks \"Book Now\"
3. Opens booking modal with date/guest selection
4. Submits booking request to backend
5. System creates booking and redirects to payment
6. User enters payment details via Razorpay
7. Payment webhook confirms transaction
8. Booking status updated to confirmed
9. User receives confirmation email

## Key Features Details

### Maps Integration
- Google Maps for route planning and directions
- MapTiler for hotel location visualization
- Geolocation API for user's current position
- Interactive markers and route polylines

### User Preferences
- Stored in Context API
- Persisted in localStorage
- JWT token in localStorage for session

### Real-time Data
- Hotel availability checked per booking
- Current room status reflected immediately
- Payment status updated via webhook
- Booking confirmation instant
